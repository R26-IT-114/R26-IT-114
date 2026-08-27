export const imageDataUrlTo20x20Pixels = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const sourceCanvas = document.createElement("canvas");
      const sourceCtx = sourceCanvas.getContext("2d");

      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;

      sourceCtx.fillStyle = "white";
      sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceCtx.drawImage(img, 0, 0);

      const sourceData = sourceCtx.getImageData(
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height
      );

      let minX = sourceCanvas.width;
      let minY = sourceCanvas.height;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < sourceCanvas.height; y++) {
        for (let x = 0; x < sourceCanvas.width; x++) {
          const i = (y * sourceCanvas.width + x) * 4;
          const r = sourceData.data[i];
          const g = sourceData.data[i + 1];
          const b = sourceData.data[i + 2];

          const gray = (r + g + b) / 3;

          if (gray < 245) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (minX > maxX || minY > maxY) {
        resolve(Array(400).fill(0));
        return;
      }

      const padding = 30;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(sourceCanvas.width, maxX + padding);
      maxY = Math.min(sourceCanvas.height, maxY + padding);

      const cropWidth = maxX - minX;
      const cropHeight = maxY - minY;

      const normalizedCanvas = document.createElement("canvas");
      const normalizedCtx = normalizedCanvas.getContext("2d");

      normalizedCanvas.width = 20;
      normalizedCanvas.height = 20;

      normalizedCtx.fillStyle = "white";
      normalizedCtx.fillRect(0, 0, 20, 20);

      const scale = Math.min(16 / cropWidth, 16 / cropHeight);
      const newWidth = cropWidth * scale;
      const newHeight = cropHeight * scale;

      const offsetX = (20 - newWidth) / 2;
      const offsetY = (20 - newHeight) / 2;

      normalizedCtx.drawImage(
        sourceCanvas,
        minX,
        minY,
        cropWidth,
        cropHeight,
        offsetX,
        offsetY,
        newWidth,
        newHeight
      );

      const imageData = normalizedCtx.getImageData(0, 0, 20, 20);
      const pixels = [];

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const gray = Math.round((r + g + b) / 3);
        pixels.push(255 - gray);
      }

      resolve(pixels);
    };

    img.onerror = reject;
    img.src = dataUrl;
  });
};