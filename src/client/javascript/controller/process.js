function process(context, video) {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  let width = context.canvas.width;
  let height = context.canvas.height;
  let data = imageData.data;

  // could use fast typed arrays for processing
  // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    let a = data[i+3];
    data[i+2] = 0;
  }

  context.putImageData(imageData, 0, 0);
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
