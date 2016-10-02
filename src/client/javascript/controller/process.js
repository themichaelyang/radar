function process(context, video) {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  let processingImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  let width = context.canvas.width;
  let height = context.canvas.height;
  let data = imageData.data;

  // could use fast typed arrays for processing
  // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
  for (let i = 0; i < data.length; i++) {
    let r = data[i++];
    let g = data[i++];
    let b = data[i++];
    let a = data[i++];
  }

  ctx.putImageData(processingImageData, 0, 0);
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
