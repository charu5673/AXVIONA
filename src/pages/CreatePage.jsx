import React, { useState, useRef, useEffect, useCallback } from "react";

import CanvasToolbar from "../components/CanvasToolbar";

function CreatePage() {
  const rows = 148;
  const cols = 108;

  const emptyGrid = () =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "#00000000")
    );

  const [grid, setGrid] = useState(emptyGrid());
  const [history, setHistory] = useState([emptyGrid()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentAlpha, setCurrentAlpha] = useState(1);
  const [mouseDown, setMouseDown] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [baseOpacity, setBaseOpacity] = useState(0.4);
  const [zoom, setZoom] = useState(5);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [currentTool, setCurrentTool] = useState("brush");

  const canvasRef = useRef(null);
  const baseImageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = "src/assets/base/base_extended.png";
    img.onload = () => {
      baseImageRef.current = img;
      drawCanvas();
    };
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImageRef.current) {
      ctx.globalAlpha = baseOpacity;
      ctx.drawImage(baseImageRef.current, 0, 0, cols, rows);
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const color = grid[i][j];
        if (color !== "#00000000") {
          ctx.fillStyle = color;
          ctx.fillRect(j, i, 1, 1);
        }
      }
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [grid, baseOpacity]);

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const updateCellTemp = (i, j, color) => {
    setGrid((prev) => {
      if (prev[i][j] === color) return prev;
      const newGrid = prev.map((row, x) =>
        row.map((cell, y) => (x === i && y === j ? color : cell))
      );
      return newGrid;
    });
  };

  const floodFill = (gridCopy, startY, startX, fillColor) => {
    const oldColor = gridCopy[startY][startX];
    if (oldColor === fillColor) return [];

    const filled = [];
    const stack = [[startY, startX]];

    while (stack.length) {
      const [y, x] = stack.pop();
      if (y < 0 || x < 0 || y >= rows || x >= cols) continue;
      if (gridCopy[y][x] !== oldColor) continue;

      filled.push({ y, x });
      gridCopy[y][x] = fillColor;
      stack.push([y + 1, x]);
      stack.push([y - 1, x]);
      stack.push([y, x + 1]);
      stack.push([y, x - 1]);
    }

    return filled;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);

    setMouseDown(true);
    setIsErasing(e.button === 2 || currentTool == "erase");

    const color = isErasing ? "#00000000" : hexToRgba(currentColor, currentAlpha);

    if (currentTool === "bucket") {
      const gridCopy = grid.map((row) => [...row]);
      const filledCells = floodFill(gridCopy, y, x, color);

      if (filledCells.length > 0) {
        setGrid(gridCopy);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(gridCopy);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      return;
    }

    updateCellTemp(y, x, color);
    setCurrentStroke([{ y, x, color }]);
  };

  const handleMouseMove = (e) => {
    if (!mouseDown || currentTool === "bucket") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);

    if (x >= 0 && y >= 0 && x < cols && y < rows) {
      const color = isErasing ? "#00000000" : hexToRgba(currentColor, currentAlpha);
      updateCellTemp(y, x, color);
      setCurrentStroke((prev) => [...prev, { y, x, color }]);
    }
  };

  const handleMouseUp = () => {
    if (!mouseDown || currentTool === "bucket") return;
    setMouseDown(false);

    if (currentStroke.length === 0) return;

    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      currentStroke.forEach(({ y, x, color }) => (newGrid[y][x] = color));
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newGrid);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return newGrid;
    });

    setCurrentStroke([]);
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setGrid(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setGrid(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history]);

  const clearGrid = () => {
    const cleared = emptyGrid();
    setGrid(cleared);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(cleared);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const palette = [
    "#000000",
    "#808080",
    "#ffffff",
    "#c22a2aff",
    "#45d345ff",
    "#3939e6ff",
    "#ffff5fff",
    "#ff50ffff",
    "#85ffffff",
    "#800000",
    "#ffa500",
    "#008000",
    "#800080",
    "#008080",
    "#000080",
    "#ffc0cb",
    "#add8e6",
    "#90ee90",
    "#ffb6c1",
    "#dda0dd",
    "#f5deb3",
    "#d3d3d3",
    "#ffe4b5",
    "#fafad2"
  ];


  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div id="create-page">

      <CanvasToolbar
        setCurrentTool={setCurrentTool}
        setBaseOpacity={setBaseOpacity}
        zoom={zoom}
        setZoom={setZoom}
        palette={palette}
        clearGrid={clearGrid}
        redo={redo}
        undo={undo}
        setCurrentAlpha={setCurrentAlpha}
        setCurrentColor={setCurrentColor}
        currentTool={currentTool}
        currentColor={currentColor}
        baseOpacity={baseOpacity}
        currentAlpha={currentAlpha}
      />

      <div
        id="canvas-outer"
      >
        <canvas
          ref={canvasRef}
          width={cols}
          height={rows}
          style={{ imageRendering: "pixelated", cursor: "crosshair",
          transform: `scale(${zoom})`,
          transformOrigin: "top",
          marginTop: `-500px`}}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}

export default CreatePage;
