import { ChromePicker } from "react-color";

function CanvasToolbar({
  setCurrentTool,
  currentTool,
  palette,
  currentColor,
  currentAlpha,
  setCurrentAlpha,
  setCurrentColor,
  undo,
  redo,
  clearGrid,
  baseOpacity,
  setBaseOpacity,
  zoom,
  setZoom,
}) {
  return (
    <div id="canvas-toolbar">
      <div className="tools">
        {["brush", "erase", "bucket"].map((tool) => (
          <button className={`canvas-tool ${(tool == currentTool) ? "selected" : ""}`} id={tool}
            key={tool}
            onClick={() => setCurrentTool(tool)}
          >
            {tool}
          </button>
        ))}
      </div>
      

      <div className="palette">
        {palette.map((color) => (
          <button className="palette-color"
            key={color}
            style={{
              backgroundColor: color,
              width: "24px",
              height: "24px",
              margin: "2px",
              border:
                currentColor === color && currentAlpha === 1
                  ? "2px solid #444"
                  : "1px solid #000",
            }}
            onClick={() => {
              setCurrentColor(color);
              setCurrentAlpha(1);
            }}
          />
        ))}
      </div>

      <div>
        <ChromePicker
          color={{ r: parseInt(currentColor.slice(1, 3), 16),
                   g: parseInt(currentColor.slice(3, 5), 16),
                   b: parseInt(currentColor.slice(5, 7), 16),
                   a: currentAlpha }}
          onChange={(color) => {
            setCurrentColor(
              `${color.hex}`
            );
            setCurrentAlpha(color.rgb.a);
          }}
        />
      </div>

      <div>
        <button onClick={undo}>
          Undo
        </button>
        <button onClick={redo}>
          Redo
        </button>
        <button onClick={clearGrid}>Clear</button>
      </div>

      <label>
        Base opacity:
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={baseOpacity}
          onChange={(e) => setBaseOpacity(parseFloat(e.target.value))}
        />
      </label>

      <label>
        Zoom:
        <input
          type="range"
          min="1"
          max="20"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
}

export default CanvasToolbar;
