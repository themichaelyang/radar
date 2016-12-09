// should be set via config
window.magic = 0.05;

// takes in contexts
function frameDifference(current, previous, processing) {
  let currentCanvas = current.canvas;
  let width = currentCanvas.width;
  let height = currentCanvas.height;

  let currentImageData = current.getImageData(0, 0, width, height);
  let previousImageData = previous.getImageData(0, 0, width, height);

  let processingImageData = current.getImageData(0, 0, width, height);

  let currentPixel = {};
  let previousPixel = {};

  for (let i = 0; i < currentImageData.data.length; i += 4) {
    currentPixel.r = currentImageData.data[i];
    currentPixel.g = currentImageData.data[i+1];
    currentPixel.b = currentImageData.data[i+2];

    previousPixel.r = previousImageData.data[i];
    previousPixel.g = previousImageData.data[i+1];
    previousPixel.b = previousImageData.data[i+2];

    let distance = colorDistance(currentPixel, previousPixel);
    if (distance > window.magic) {
      setImageDataPixel(i, processingImageData, 0, 0, 0, 255);
    }
    else {
      setImageDataPixel(i, processingImageData, 255, 255, 255, 255);
    }
  }

  processing.putImageData(processingImageData, 0, 0);
}

function setImageDataPixel(index, imageData, r, g, b, a) {
  imageData.data[index] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

// returns value from 0 - 1
function colorDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.r - p2.r, 2) + Math.pow(p1.g - p2.g, 2) + Math.pow(p1.b - p2.b, 2)) / 441.673;
}

function indexToCoordinate(index, width) {
  let x = index % width;
  let y = (index - x) / width;
  return {
    x: x,
    y: y
  }
}

function coordinateToIndex(x, y, width) {
  return (y * width) + x;
}
