import { useState, useLayoutEffect, createRef, useRef, useEffect } from "react";
import { GridStack } from "gridstack";
import { debounce } from "lodash";
import "./index.css";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.css";

const Item = ({ id }) => <div>{id}</div>;

const ControlledStack = ({ items, addItem }) => {
  const refs = useRef({});
  const gridRef = useRef();

  if (Object.keys(refs.current).length !== items.length) {
    items.forEach(({ id }) => {
      refs.current[id] = refs.current[id] || createRef();
    });
  }

  const handleDragStop = debounce((event, items) => {
    const element = items;
    const id = element.getAttribute("data-id");
    const node = gridRef.current.engine.nodes.find((n) => n.el === element);
    const x = node.x;
    const y = node.y;
    console.log(`Item ${id} moved to position (${x}, ${y})`);

    // Save the current state of the grid
    const gridState = gridRef.current.save();

    // Log the current state of the grid
    console.log("Current grid state:", gridState);
  }, 500);

  console.log("items", items);

  useEffect(() => {
    gridRef.current =
      gridRef.current ||
      GridStack.init({
        float: true,
        disableResize: true,
        removable: "#trash",
        minRow: 20,
        verticalMargin: 18,
        horizontalMargin: 9,
      });

    const grid = gridRef.current;
    grid.batchUpdate();
    grid.removeAll(false);
    items.forEach(({ id }) => {
      const widget = grid.makeWidget(refs.current[id].current);
      widget.setAttribute("data-id", id);
    });
    grid.off("added removed change");
    grid.on("added removed change", function (e, items) {
      let str = "";
      items.forEach(function (item) {
        str += " (x,y)=" + item.x + "," + item.y;
      });
      console.log(e.type + " " + items.length + " items:" + str);
    });
    // grid.on("dragstop", handleDragStop);
    grid.batchUpdate(false);
  }, [items]);

  return (
    <div>
      <div className="flex">
        <button onClick={addItem}>Add new widget</button>
        <div id="trash"></div>
      </div>
      <div className={`grid-stack controlled`}>
        {[...items].map((item, i) => {
          return (
            <div
              ref={refs.current[item.id]}
              key={item.id}
              className={"grid-stack-item"}>
              <div className="grid-stack-item-content">
                <Item {...item} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ControlledExample = () => {
  const [items, setItems] = useState([{ id: "item-1" }, { id: "item-2" }]);
  return (
    <ControlledStack
      items={items}
      addItem={() =>
        setItems([
          ...items,
          {
            id: `item-${items.length + 1}`,
          },
        ])
      }
    />
  );
};
export default ControlledExample;
