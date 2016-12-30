'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// could speed this up by using a typed 2d array rather than a canvas context
// todo: do not send anything if no differences between the frames, to distinguish from not enough differences
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvY29udHJvbGxlci9nZXQtY29vcmRpbmF0ZXMuanMiXSwibmFtZXMiOlsiZ2V0Q29vcmRpbmF0ZXMiLCJkaWZmZXJlbmNlTWFwIiwieE5hbWUiLCJ5TmFtZSIsIndpZHRoIiwiY2FudmFzIiwiaGVpZ2h0IiwidG90YWxYIiwidG90YWxZIiwiaGlnaGVzdFkiLCJ0b3RhbFBpeGVscyIsImRpZmZlcmVuY2VNYXBJbWFnZURhdGEiLCJnZXRJbWFnZURhdGEiLCJpIiwiZGF0YSIsImxlbmd0aCIsImNvb3JkIiwiaW5kZXhUb0Nvb3JkaW5hdGUiLCJjaGVja0lzUGl4ZWxTdXJyb3VuZGVkIiwieCIsInkiLCJwZXJjZW50Q2hhbmdlZCIsImltYWdlRGF0YSIsImluZGV4ZXMiLCJpc1N1cnJvdW5kZWQiLCJwdXNoIiwiY29vcmRpbmF0ZVRvSW5kZXgiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0EsU0FBU0EsY0FBVCxDQUF3QkMsYUFBeEIsRUFBaUU7QUFBQTs7QUFBQSxNQUExQkMsS0FBMEIsdUVBQWxCLEdBQWtCO0FBQUEsTUFBYkMsS0FBYSx1RUFBTCxHQUFLOztBQUMvRCxNQUFJQyxRQUFRSCxjQUFjSSxNQUFkLENBQXFCRCxLQUFqQztBQUNBLE1BQUlFLFNBQVNMLGNBQWNJLE1BQWQsQ0FBcUJDLE1BQWxDOztBQUVBLE1BQUlDLFNBQVMsQ0FBYjtBQUNBLE1BQUlDLFNBQVMsQ0FBYjtBQUNBLE1BQUlDLGlCQUFKO0FBQ0EsTUFBSUMsY0FBYyxDQUFsQjs7QUFFQSxNQUFJQyx5QkFBeUJWLGNBQWNXLFlBQWQsQ0FBMkIsQ0FBM0IsRUFBOEIsQ0FBOUIsRUFBaUNSLEtBQWpDLEVBQXdDRSxNQUF4QyxDQUE3QjtBQUNBLE9BQUssSUFBSU8sSUFBSSxDQUFiLEVBQWdCQSxJQUFJRix1QkFBdUJHLElBQXZCLENBQTRCQyxNQUFoRCxFQUF3REYsS0FBSyxDQUE3RCxFQUFnRTtBQUM5RCxRQUFJRix1QkFBdUJHLElBQXZCLENBQTRCRCxDQUE1QixNQUFtQyxDQUF2QyxFQUEwQztBQUN4QyxVQUFJRyxRQUFRQyxrQkFBa0JKLElBQUksQ0FBdEIsRUFBeUJULEtBQXpCLENBQVo7O0FBRUEsVUFBSWMsdUJBQXVCRixLQUF2QixFQUE4Qkwsc0JBQTlCLEVBQXNEUCxLQUF0RCxDQUFKLEVBQWtFO0FBQ2hFRyxrQkFBVVMsTUFBTUcsQ0FBaEI7QUFDQVgsa0JBQVVRLE1BQU1JLENBQWhCO0FBQ0EsWUFBSSxDQUFDWCxRQUFMLEVBQWU7QUFDYkEscUJBQVdPLE1BQU1JLENBQWpCO0FBQ0Q7QUFDRFYsdUJBQWUsQ0FBZjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxNQUFJVyxpQkFBaUJYLGVBQWVOLFFBQVFFLE1BQXZCLENBQXJCO0FBQ0EsTUFBSWUsaUJBQWlCLElBQWpCLElBQXlCQSxpQkFBaUIsR0FBOUMsRUFBbUQ7QUFDakQsV0FBTyxLQUFQO0FBQ0Q7QUFDRCwwQ0FDR25CLEtBREgsRUFDWUssU0FBU0csV0FBVixHQUF5Qk4sS0FEcEMseUJBRUdELEtBRkgsRUFFV00sV0FBV0gsTUFGdEI7QUFLRDs7QUFFRDtBQUNBLFNBQVNZLHNCQUFULENBQWdDRixLQUFoQyxFQUF1Q00sU0FBdkMsRUFBa0RsQixLQUFsRCxFQUF5RDtBQUN2RCxNQUFJbUIsVUFBVSxFQUFkO0FBQ0EsTUFBSUMsZUFBZSxJQUFuQjtBQUNBRCxVQUFRRSxJQUFSLENBQWFDLGtCQUFrQlYsTUFBTUcsQ0FBTixHQUFVLENBQTVCLEVBQStCSCxNQUFNSSxDQUFOLEdBQVUsQ0FBekMsRUFBNENoQixLQUE1QyxDQUFiO0FBQ0FtQixVQUFRRSxJQUFSLENBQWFDLGtCQUFrQlYsTUFBTUcsQ0FBeEIsRUFBMkJILE1BQU1JLENBQU4sR0FBVSxDQUFyQyxFQUF3Q2hCLEtBQXhDLENBQWI7QUFDQW1CLFVBQVFFLElBQVIsQ0FBYUMsa0JBQWtCVixNQUFNRyxDQUFOLEdBQVUsQ0FBNUIsRUFBK0JILE1BQU1JLENBQXJDLEVBQXdDaEIsS0FBeEMsQ0FBYjtBQUNBbUIsVUFBUUUsSUFBUixDQUFhQyxrQkFBa0JWLE1BQU1HLENBQU4sR0FBVSxDQUE1QixFQUErQkgsTUFBTUksQ0FBTixHQUFVLENBQXpDLEVBQTRDaEIsS0FBNUMsQ0FBYjtBQUNBbUIsVUFBUUUsSUFBUixDQUFhQyxrQkFBa0JWLE1BQU1HLENBQXhCLEVBQTJCSCxNQUFNSSxDQUFOLEdBQVUsQ0FBckMsRUFBd0NoQixLQUF4QyxDQUFiO0FBQ0FtQixVQUFRRSxJQUFSLENBQWFDLGtCQUFrQlYsTUFBTUcsQ0FBTixHQUFVLENBQTVCLEVBQStCSCxNQUFNSSxDQUFyQyxFQUF3Q2hCLEtBQXhDLENBQWI7O0FBUnVEO0FBQUE7QUFBQTs7QUFBQTtBQVV2RCx5QkFBY21CLE9BQWQsOEhBQXVCO0FBQUEsVUFBZFYsQ0FBYzs7QUFDckJXLHFCQUFlQSxnQkFBZ0JGLFVBQVVSLElBQVYsQ0FBZUQsQ0FBZixNQUFzQixHQUFyRDtBQUNEO0FBWnNEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBY3ZELFNBQU9XLFlBQVA7QUFDRCIsImZpbGUiOiJqYXZhc2NyaXB0L2NvbnRyb2xsZXIvZ2V0LWNvb3JkaW5hdGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY291bGQgc3BlZWQgdGhpcyB1cCBieSB1c2luZyBhIHR5cGVkIDJkIGFycmF5IHJhdGhlciB0aGFuIGEgY2FudmFzIGNvbnRleHRcbi8vIHRvZG86IGRvIG5vdCBzZW5kIGFueXRoaW5nIGlmIG5vIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGZyYW1lcywgdG8gZGlzdGluZ3Vpc2ggZnJvbSBub3QgZW5vdWdoIGRpZmZlcmVuY2VzXG5mdW5jdGlvbiBnZXRDb29yZGluYXRlcyhkaWZmZXJlbmNlTWFwLCB4TmFtZSA9ICd4JywgeU5hbWUgPSAneScpIHtcbiAgbGV0IHdpZHRoID0gZGlmZmVyZW5jZU1hcC5jYW52YXMud2lkdGg7XG4gIGxldCBoZWlnaHQgPSBkaWZmZXJlbmNlTWFwLmNhbnZhcy5oZWlnaHQ7XG5cbiAgbGV0IHRvdGFsWCA9IDA7XG4gIGxldCB0b3RhbFkgPSAwO1xuICBsZXQgaGlnaGVzdFk7XG4gIGxldCB0b3RhbFBpeGVscyA9IDA7XG5cbiAgbGV0IGRpZmZlcmVuY2VNYXBJbWFnZURhdGEgPSBkaWZmZXJlbmNlTWFwLmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaWZmZXJlbmNlTWFwSW1hZ2VEYXRhLmRhdGEubGVuZ3RoOyBpICs9IDQpIHtcbiAgICBpZiAoZGlmZmVyZW5jZU1hcEltYWdlRGF0YS5kYXRhW2ldID09PSAwKSB7XG4gICAgICBsZXQgY29vcmQgPSBpbmRleFRvQ29vcmRpbmF0ZShpIC8gNCwgd2lkdGgpO1xuXG4gICAgICBpZiAoY2hlY2tJc1BpeGVsU3Vycm91bmRlZChjb29yZCwgZGlmZmVyZW5jZU1hcEltYWdlRGF0YSwgd2lkdGgpKSB7XG4gICAgICAgIHRvdGFsWCArPSBjb29yZC54O1xuICAgICAgICB0b3RhbFkgKz0gY29vcmQueTtcbiAgICAgICAgaWYgKCFoaWdoZXN0WSkge1xuICAgICAgICAgIGhpZ2hlc3RZID0gY29vcmQueTtcbiAgICAgICAgfVxuICAgICAgICB0b3RhbFBpeGVscyArPSAxO1xuICAgICAgfVxuICAgIH0gXG4gIH1cblxuICBsZXQgcGVyY2VudENoYW5nZWQgPSB0b3RhbFBpeGVscyAvICh3aWR0aCAqIGhlaWdodCk7XG4gIGlmIChwZXJjZW50Q2hhbmdlZCA8IDAuMDEgfHwgcGVyY2VudENoYW5nZWQgPiAwLjQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBbeE5hbWVdOiAodG90YWxYIC8gdG90YWxQaXhlbHMpIC8gd2lkdGgsXG4gICAgW3lOYW1lXTogaGlnaGVzdFkgLyBoZWlnaHRcbiAgICAvLyBbeU5hbWVdOiAodG90YWxZIC8gdG90YWxQaXhlbHMpIC8gaGVpZ2h0XG4gIH1cbn1cblxuLy8gcmVhbGx5IGJhZCFcbmZ1bmN0aW9uIGNoZWNrSXNQaXhlbFN1cnJvdW5kZWQoY29vcmQsIGltYWdlRGF0YSwgd2lkdGgpIHtcbiAgbGV0IGluZGV4ZXMgPSBbXTtcbiAgbGV0IGlzU3Vycm91bmRlZCA9IHRydWU7XG4gIGluZGV4ZXMucHVzaChjb29yZGluYXRlVG9JbmRleChjb29yZC54ICsgMSwgY29vcmQueSArIDEsIHdpZHRoKSk7XG4gIGluZGV4ZXMucHVzaChjb29yZGluYXRlVG9JbmRleChjb29yZC54LCBjb29yZC55ICsgMSwgd2lkdGgpKTtcbiAgaW5kZXhlcy5wdXNoKGNvb3JkaW5hdGVUb0luZGV4KGNvb3JkLnggKyAxLCBjb29yZC55LCB3aWR0aCkpO1xuICBpbmRleGVzLnB1c2goY29vcmRpbmF0ZVRvSW5kZXgoY29vcmQueCAtIDEsIGNvb3JkLnkgLSAxLCB3aWR0aCkpO1xuICBpbmRleGVzLnB1c2goY29vcmRpbmF0ZVRvSW5kZXgoY29vcmQueCwgY29vcmQueSAtIDEsIHdpZHRoKSk7XG4gIGluZGV4ZXMucHVzaChjb29yZGluYXRlVG9JbmRleChjb29yZC54IC0gMSwgY29vcmQueSwgd2lkdGgpKTtcblxuICBmb3IgKGxldCBpIG9mIGluZGV4ZXMpIHtcbiAgICBpc1N1cnJvdW5kZWQgPSBpc1N1cnJvdW5kZWQgJiYgaW1hZ2VEYXRhLmRhdGFbaV0gPT09IDI1NTtcbiAgfVxuXG4gIHJldHVybiBpc1N1cnJvdW5kZWQ7XG59XG4iXX0=
