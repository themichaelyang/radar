function process(context, video) {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  let width = context.canvas.width;
  let height = context.canvas.height;
  let data = imageData.data;

  // could use fast typed arrays for processing
  // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/

  // colorNormalize(data);
  greyWorldNormalize(data);
  // colorDetection(data, [{r: 93, g:80, b:91}]);

  context.putImageData(imageData, 0, 0);
}

function colorDetection(data, colorProfile) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];

    for (let j = 0; j < colorProfile.length; j++) {
      if (colorDistance(colorProfile[j], {r: r, g: g, b: b}) < 10) {
        setColor(data, i, {r: 255, g: 255, b: 255});
        break;
      }
      else { // could set after loop detects
        setColor(data, i, {r: 0, g: 0, b: 0});
      }
    }
  }
}

function setColor(data, index, color) {
  data[index] = color.r;
  data[index+1] = color.g;
  data[index+2] = color.b;
}

// should set to direct r g b distances, i think this can introduce errors
function colorDistance(co, ct) {
  return Math.sqrt(Math.pow(co.r - ct.r, 2) + Math.pow(co.g - ct.g, 2) + Math.pow(co.b - ct.b, 2));
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
