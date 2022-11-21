import React, { useEffect, useRef, useState } from "react";
import { Table } from "antd";
import classNames from "classnames";
import ResizeObserver from "rc-resize-observer";
import { VariableSizeGrid as Grid } from "react-window";

const ROW_HEIGHT = 56;
const TABLE_HEIGHT = ROW_HEIGHT * 10;

const VirtualTable = (props) => {
  const { columns } = props;
  const [tableWidth, setTableWidth] = useState(0);

  const widthColumnCount = columns.filter(({ width }) => !width).length;

  const mergedColumns = columns.map((column) => {
    if (column.width) {
      return column;
    }

    return {
      ...column,
      width: Math.floor(tableWidth / widthColumnCount),
    };
  });

  const gridRef = useRef();
  const [connectObject] = useState(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => {
        if (gridRef.current) {
          return gridRef.current?.state?.scrollLeft;
        }
        return null;
      },
      set: (scrollLeft) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (rawData, { scrollbarSize, ref, onScroll }) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * ROW_HEIGHT;

    return (
      <Grid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index) => {
          const { width } = mergedColumns[index];
          return totalHeight > TABLE_HEIGHT &&
            index === mergedColumns.length - 1
            ? width - scrollbarSize - 1
            : width;
        }}
        height={ROW_HEIGHT * 10}
        rowCount={rawData.length}
        rowHeight={() => ROW_HEIGHT}
        width={tableWidth}
        onScroll={({ scrollLeft }) => {
          onScroll({ scrollLeft });
        }}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div className={classNames("virtual-table-cell")} style={style}>
            {rawData[rowIndex][mergedColumns[columnIndex].dataIndex]}
          </div>
        )}
      </Grid>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        scroll={{ y: TABLE_HEIGHT }}
        dataSource={props.dataSource}
        columns={mergedColumns}
        pagination={false}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
};

const columns = [
  { title: "Row", dataIndex: "key" },
  { title: "Col1", dataIndex: "key" },
  { title: "Col2", dataIndex: "key" },
  { title: "Col3", dataIndex: "key" },
  { title: "Col4", dataIndex: "key" },
  { title: "Col5", dataIndex: "key" },
  { title: "Col6", dataIndex: "key" },
  { title: "Col7", dataIndex: "key" },
  { title: "Col8", dataIndex: "key" },
  { title: "Col9", dataIndex: "key" },
];

const data = Array.from({ length: 1000000 }, (_, key) => ({ key }));

const App = () => <VirtualTable columns={columns} dataSource={data} />;

export default App;
