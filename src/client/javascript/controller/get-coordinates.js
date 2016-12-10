// could speed this up by using a typed 2d array rather than a canvas context
function getCoordinates(differenceMap, xName = 'x', yName = 'y') {
  let width = differenceMap.canvas.width;
  let height = differenceMap.canvas.height;

  let totalX = 0;
  let totalY = 0;
  let highestY;
  let totalPixels = 0;

  let differenceMapImageData = differenceMap.getImageData(0, 0, width, height);
  for (let i = 0; i < differenceMapImageData.data.length; i += 4) {
    if (differenceMapImageData.data[i] === 0) {
      let coord = indexToCoordinate(i / 4, width);

      if (checkIsPixelSurrounded(coord, differenceMapImageData, width)) {
        totalX += coord.x;
        totalY += coord.y;
        if (!highestY) {
          highestY = coord.y;
        }
        totalPixels += 1;
      }
    }
  }

  let percentChanged = totalPixels / (width * height);
  if (percentChanged < 0.01 || percentChanged > 0.4) {
    return false;
  }
  return {
    [xName]: (totalX / totalPixels) / width,
    [yName]: highestY / height
    // [yName]: (totalY / totalPixels) / height
  }
}

// really bad!
function checkIsPixelSurrounded(coord, imageData, width) {
  let indexes = [];
  let isSurrounded = true;
  indexes.push(coordinateToIndex(coord.x + 1, coord.y + 1, width));
  indexes.push(coordinateToIndex(coord.x, coord.y + 1, width));
  indexes.push(coordinateToIndex(coord.x + 1, coord.y, width));
  indexes.push(coordinateToIndex(coord.x - 1, coord.y - 1, width));
  indexes.push(coordinateToIndex(coord.x, coord.y - 1, width));
  indexes.push(coordinateToIndex(coord.x - 1, coord.y, width));

  for (let i of indexes) {
    isSurrounded = isSurrounded && imageData.data[i] === 255;
  }

  return isSurrounded;
}
