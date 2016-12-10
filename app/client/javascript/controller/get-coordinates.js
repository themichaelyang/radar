'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// could speed this up by using a typed 2d array rather than a canvas context
function getCoordinates(differenceMap) {
  var _ref;

  var xName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';
  var yName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'y';

  var width = differenceMap.canvas.width;
  var height = differenceMap.canvas.height;

  var totalX = 0;
  var totalY = 0;
  var highestY = void 0;
  var totalPixels = 0;

  var differenceMapImageData = differenceMap.getImageData(0, 0, width, height);
  for (var i = 0; i < differenceMapImageData.data.length; i += 4) {
    if (differenceMapImageData.data[i] === 0) {
      var coord = indexToCoordinate(i / 4, width);

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

  var percentChanged = totalPixels / (width * height);
  if (percentChanged < 0.01 || percentChanged > 0.4) {
    return false;
  }
  return _ref = {}, _defineProperty(_ref, xName, totalX / totalPixels / width), _defineProperty(_ref, yName, highestY / height), _ref;
}

// really bad!
function checkIsPixelSurrounded(coord, imageData, width) {
  var indexes = [];
  var isSurrounded = true;
  indexes.push(coordinateToIndex(coord.x + 1, coord.y + 1, width));
  indexes.push(coordinateToIndex(coord.x, coord.y + 1, width));
  indexes.push(coordinateToIndex(coord.x + 1, coord.y, width));
  indexes.push(coordinateToIndex(coord.x - 1, coord.y - 1, width));
  indexes.push(coordinateToIndex(coord.x, coord.y - 1, width));
  indexes.push(coordinateToIndex(coord.x - 1, coord.y, width));

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = indexes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var i = _step.value;

      isSurrounded = isSurrounded && imageData.data[i] === 255;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return isSurrounded;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvY29udHJvbGxlci9nZXQtY29vcmRpbmF0ZXMuanMiXSwibmFtZXMiOlsiZ2V0Q29vcmRpbmF0ZXMiLCJkaWZmZXJlbmNlTWFwIiwieE5hbWUiLCJ5TmFtZSIsIndpZHRoIiwiY2FudmFzIiwiaGVpZ2h0IiwidG90YWxYIiwidG90YWxZIiwiaGlnaGVzdFkiLCJ0b3RhbFBpeGVscyIsImRpZmZlcmVuY2VNYXBJbWFnZURhdGEiLCJnZXRJbWFnZURhdGEiLCJpIiwiZGF0YSIsImxlbmd0aCIsImNvb3JkIiwiaW5kZXhUb0Nvb3JkaW5hdGUiLCJjaGVja0lzUGl4ZWxTdXJyb3VuZGVkIiwieCIsInkiLCJwZXJjZW50Q2hhbmdlZCIsImltYWdlRGF0YSIsImluZGV4ZXMiLCJpc1N1cnJvdW5kZWQiLCJwdXNoIiwiY29vcmRpbmF0ZVRvSW5kZXgiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBLFNBQVNBLGNBQVQsQ0FBd0JDLGFBQXhCLEVBQWlFO0FBQUE7O0FBQUEsTUFBMUJDLEtBQTBCLHVFQUFsQixHQUFrQjtBQUFBLE1BQWJDLEtBQWEsdUVBQUwsR0FBSzs7QUFDL0QsTUFBSUMsUUFBUUgsY0FBY0ksTUFBZCxDQUFxQkQsS0FBakM7QUFDQSxNQUFJRSxTQUFTTCxjQUFjSSxNQUFkLENBQXFCQyxNQUFsQzs7QUFFQSxNQUFJQyxTQUFTLENBQWI7QUFDQSxNQUFJQyxTQUFTLENBQWI7QUFDQSxNQUFJQyxpQkFBSjtBQUNBLE1BQUlDLGNBQWMsQ0FBbEI7O0FBRUEsTUFBSUMseUJBQXlCVixjQUFjVyxZQUFkLENBQTJCLENBQTNCLEVBQThCLENBQTlCLEVBQWlDUixLQUFqQyxFQUF3Q0UsTUFBeEMsQ0FBN0I7QUFDQSxPQUFLLElBQUlPLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsdUJBQXVCRyxJQUF2QixDQUE0QkMsTUFBaEQsRUFBd0RGLEtBQUssQ0FBN0QsRUFBZ0U7QUFDOUQsUUFBSUYsdUJBQXVCRyxJQUF2QixDQUE0QkQsQ0FBNUIsTUFBbUMsQ0FBdkMsRUFBMEM7QUFDeEMsVUFBSUcsUUFBUUMsa0JBQWtCSixJQUFJLENBQXRCLEVBQXlCVCxLQUF6QixDQUFaOztBQUVBLFVBQUljLHVCQUF1QkYsS0FBdkIsRUFBOEJMLHNCQUE5QixFQUFzRFAsS0FBdEQsQ0FBSixFQUFrRTtBQUNoRUcsa0JBQVVTLE1BQU1HLENBQWhCO0FBQ0FYLGtCQUFVUSxNQUFNSSxDQUFoQjtBQUNBLFlBQUksQ0FBQ1gsUUFBTCxFQUFlO0FBQ2JBLHFCQUFXTyxNQUFNSSxDQUFqQjtBQUNEO0FBQ0RWLHVCQUFlLENBQWY7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsTUFBSVcsaUJBQWlCWCxlQUFlTixRQUFRRSxNQUF2QixDQUFyQjtBQUNBLE1BQUllLGlCQUFpQixJQUFqQixJQUF5QkEsaUJBQWlCLEdBQTlDLEVBQW1EO0FBQ2pELFdBQU8sS0FBUDtBQUNEO0FBQ0QsMENBQ0duQixLQURILEVBQ1lLLFNBQVNHLFdBQVYsR0FBeUJOLEtBRHBDLHlCQUVHRCxLQUZILEVBRVdNLFdBQVdILE1BRnRCO0FBS0Q7O0FBRUQ7QUFDQSxTQUFTWSxzQkFBVCxDQUFnQ0YsS0FBaEMsRUFBdUNNLFNBQXZDLEVBQWtEbEIsS0FBbEQsRUFBeUQ7QUFDdkQsTUFBSW1CLFVBQVUsRUFBZDtBQUNBLE1BQUlDLGVBQWUsSUFBbkI7QUFDQUQsVUFBUUUsSUFBUixDQUFhQyxrQkFBa0JWLE1BQU1HLENBQU4sR0FBVSxDQUE1QixFQUErQkgsTUFBTUksQ0FBTixHQUFVLENBQXpDLEVBQTRDaEIsS0FBNUMsQ0FBYjtBQUNBbUIsVUFBUUUsSUFBUixDQUFhQyxrQkFBa0JWLE1BQU1HLENBQXhCLEVBQTJCSCxNQUFNSSxDQUFOLEdBQVUsQ0FBckMsRUFBd0NoQixLQUF4QyxDQUFiO0FBQ0FtQixVQUFRRSxJQUFSLENBQWFDLGtCQUFrQlYsTUFBTUcsQ0FBTixHQUFVLENBQTVCLEVBQStCSCxNQUFNSSxDQUFyQyxFQUF3Q2hCLEtBQXhDLENBQWI7QUFDQW1CLFVBQVFFLElBQVIsQ0FBYUMsa0JBQWtCVixNQUFNRyxDQUFOLEdBQVUsQ0FBNUIsRUFBK0JILE1BQU1JLENBQU4sR0FBVSxDQUF6QyxFQUE0Q2hCLEtBQTVDLENBQWI7QUFDQW1CLFVBQVFFLElBQVIsQ0FBYUMsa0JBQWtCVixNQUFNRyxDQUF4QixFQUEyQkgsTUFBTUksQ0FBTixHQUFVLENBQXJDLEVBQXdDaEIsS0FBeEMsQ0FBYjtBQUNBbUIsVUFBUUUsSUFBUixDQUFhQyxrQkFBa0JWLE1BQU1HLENBQU4sR0FBVSxDQUE1QixFQUErQkgsTUFBTUksQ0FBckMsRUFBd0NoQixLQUF4QyxDQUFiOztBQVJ1RDtBQUFBO0FBQUE7O0FBQUE7QUFVdkQseUJBQWNtQixPQUFkLDhIQUF1QjtBQUFBLFVBQWRWLENBQWM7O0FBQ3JCVyxxQkFBZUEsZ0JBQWdCRixVQUFVUixJQUFWLENBQWVELENBQWYsTUFBc0IsR0FBckQ7QUFDRDtBQVpzRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWN2RCxTQUFPVyxZQUFQO0FBQ0QiLCJmaWxlIjoiamF2YXNjcmlwdC9jb250cm9sbGVyL2dldC1jb29yZGluYXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNvdWxkIHNwZWVkIHRoaXMgdXAgYnkgdXNpbmcgYSB0eXBlZCAyZCBhcnJheSByYXRoZXIgdGhhbiBhIGNhbnZhcyBjb250ZXh0XG5mdW5jdGlvbiBnZXRDb29yZGluYXRlcyhkaWZmZXJlbmNlTWFwLCB4TmFtZSA9ICd4JywgeU5hbWUgPSAneScpIHtcbiAgbGV0IHdpZHRoID0gZGlmZmVyZW5jZU1hcC5jYW52YXMud2lkdGg7XG4gIGxldCBoZWlnaHQgPSBkaWZmZXJlbmNlTWFwLmNhbnZhcy5oZWlnaHQ7XG5cbiAgbGV0IHRvdGFsWCA9IDA7XG4gIGxldCB0b3RhbFkgPSAwO1xuICBsZXQgaGlnaGVzdFk7XG4gIGxldCB0b3RhbFBpeGVscyA9IDA7XG5cbiAgbGV0IGRpZmZlcmVuY2VNYXBJbWFnZURhdGEgPSBkaWZmZXJlbmNlTWFwLmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaWZmZXJlbmNlTWFwSW1hZ2VEYXRhLmRhdGEubGVuZ3RoOyBpICs9IDQpIHtcbiAgICBpZiAoZGlmZmVyZW5jZU1hcEltYWdlRGF0YS5kYXRhW2ldID09PSAwKSB7XG4gICAgICBsZXQgY29vcmQgPSBpbmRleFRvQ29vcmRpbmF0ZShpIC8gNCwgd2lkdGgpO1xuXG4gICAgICBpZiAoY2hlY2tJc1BpeGVsU3Vycm91bmRlZChjb29yZCwgZGlmZmVyZW5jZU1hcEltYWdlRGF0YSwgd2lkdGgpKSB7XG4gICAgICAgIHRvdGFsWCArPSBjb29yZC54O1xuICAgICAgICB0b3RhbFkgKz0gY29vcmQueTtcbiAgICAgICAgaWYgKCFoaWdoZXN0WSkge1xuICAgICAgICAgIGhpZ2hlc3RZID0gY29vcmQueTtcbiAgICAgICAgfVxuICAgICAgICB0b3RhbFBpeGVscyArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBwZXJjZW50Q2hhbmdlZCA9IHRvdGFsUGl4ZWxzIC8gKHdpZHRoICogaGVpZ2h0KTtcbiAgaWYgKHBlcmNlbnRDaGFuZ2VkIDwgMC4wMSB8fCBwZXJjZW50Q2hhbmdlZCA+IDAuNCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4ge1xuICAgIFt4TmFtZV06ICh0b3RhbFggLyB0b3RhbFBpeGVscykgLyB3aWR0aCxcbiAgICBbeU5hbWVdOiBoaWdoZXN0WSAvIGhlaWdodFxuICAgIC8vIFt5TmFtZV06ICh0b3RhbFkgLyB0b3RhbFBpeGVscykgLyBoZWlnaHRcbiAgfVxufVxuXG4vLyByZWFsbHkgYmFkIVxuZnVuY3Rpb24gY2hlY2tJc1BpeGVsU3Vycm91bmRlZChjb29yZCwgaW1hZ2VEYXRhLCB3aWR0aCkge1xuICBsZXQgaW5kZXhlcyA9IFtdO1xuICBsZXQgaXNTdXJyb3VuZGVkID0gdHJ1ZTtcbiAgaW5kZXhlcy5wdXNoKGNvb3JkaW5hdGVUb0luZGV4KGNvb3JkLnggKyAxLCBjb29yZC55ICsgMSwgd2lkdGgpKTtcbiAgaW5kZXhlcy5wdXNoKGNvb3JkaW5hdGVUb0luZGV4KGNvb3JkLngsIGNvb3JkLnkgKyAxLCB3aWR0aCkpO1xuICBpbmRleGVzLnB1c2goY29vcmRpbmF0ZVRvSW5kZXgoY29vcmQueCArIDEsIGNvb3JkLnksIHdpZHRoKSk7XG4gIGluZGV4ZXMucHVzaChjb29yZGluYXRlVG9JbmRleChjb29yZC54IC0gMSwgY29vcmQueSAtIDEsIHdpZHRoKSk7XG4gIGluZGV4ZXMucHVzaChjb29yZGluYXRlVG9JbmRleChjb29yZC54LCBjb29yZC55IC0gMSwgd2lkdGgpKTtcbiAgaW5kZXhlcy5wdXNoKGNvb3JkaW5hdGVUb0luZGV4KGNvb3JkLnggLSAxLCBjb29yZC55LCB3aWR0aCkpO1xuXG4gIGZvciAobGV0IGkgb2YgaW5kZXhlcykge1xuICAgIGlzU3Vycm91bmRlZCA9IGlzU3Vycm91bmRlZCAmJiBpbWFnZURhdGEuZGF0YVtpXSA9PT0gMjU1O1xuICB9XG5cbiAgcmV0dXJuIGlzU3Vycm91bmRlZDtcbn1cbiJdfQ==
