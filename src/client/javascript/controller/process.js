function process(context, video) {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  let width = context.canvas.width;
  let height = context.canvas.height;
  let data = imageData.data;

  // could use fast typed arrays for processing
  // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/

  // to hsv
  // algorithm from http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
  // http://math.stackexchange.com/questions/556341/rgb-to-hsv-color-conversion-algorithm

  // colorNormalize(data);
  hsvNormalize(data);
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
