import { ReactSketchCanvas } from "react-sketch-canvas";

const DrawingCanvas = () => {
  return (
    <ReactSketchCanvas
      width="300px"
      height="300px"
      strokeWidth={4}
      strokeColor="black"
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px"
      }}
    />
  );
};

export default DrawingCanvas;