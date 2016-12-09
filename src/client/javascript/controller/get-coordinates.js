// could speed this up by using a typed 2d array rather than a canvas context
function getCoordinates(differenceMap, d1, d2) {
  let width = differenceMap.canvas.width;
  let height = differenceMap.canvas.height;

  let totalX = 0;
  let totalY = 0;
  let totalPixels = 0;

  let differenceMapImageData = differenceMap.getImageData(0, 0, width, height);
  for (let i = 0; i < differenceMapImageData.data.length; i += 4) {
    if (differenceMapImageData.data[i] === 0) {
      let coord = indexToCoordinate(i / 4, width);
      totalX += coord.x;
      totalY += coord.y;
      totalPixels += 1;
    }
  }

  let percentChanged = totalPixels / (width * height);
  if (percentChanged < 0.025 || percentChanged > 0.4) {
    return false;
  }
  return {
    [d1]: totalX / totalPixels,
    [d2]: totalY / totalPixels
  }
}
