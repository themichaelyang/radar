'use strict';

var socket = io(); // don't make this global

function main() {
  if (window.RTCPeerConnection) {
    (function () {
      // detect if there is webrtc peer connection even
      var enter = document.getElementById('connect-button');
      var roomNameInput = document.getElementById('room-name-input');
      var form = document.getElementById('form');
      window.channel = new Channel();
      form.onsubmit = function (event) {
        event.preventDefault(); // allows enter to be clicked lol
      };

      enter.addEventListener('click', function (event) {
        var roomName = roomNameInput.value;
        var canvas = document.createElement('canvas');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        var width = canvas.width;
        var height = canvas.height;

        document.body.append(canvas);

        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        channel.on('message', function (message) {
          try {
            console.log(JSON.parse(message.data));
            var coords = JSON.parse(message.data);
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(0, 0, width, height);

            if (coords) {
              ctx.fillStyle = 'red';
              ctx.lineTo((1 - coords.x) * width, coords.y * height);
              ctx.stroke();
              // ctx.clearRect(0, 0, canvas.width, canvas.height);
              // ctx.beginPath();
              // ctx.arc(coords.x * width, coords.y * height, 5, 0, 2 * Math.PI);
              // ctx.fill();
            } else {
              ctx.beginPath();
            }
            //
          } catch (e) {
            console.log(message.data);
          }
        });

        channel.connect(roomName).then(function (dataChannel) {
          dataChannel.send("what's up from " + channel.clientId);
        });

        enter.disabled = true;
      });
    })();
  } else {
    document.body.innerHTML = "You don't have WebRTC support!";
  }
}

window.onload = main;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvc2VydmljZS9tYWluLmpzIl0sIm5hbWVzIjpbInNvY2tldCIsImlvIiwibWFpbiIsIndpbmRvdyIsIlJUQ1BlZXJDb25uZWN0aW9uIiwiZW50ZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicm9vbU5hbWVJbnB1dCIsImZvcm0iLCJjaGFubmVsIiwiQ2hhbm5lbCIsIm9uc3VibWl0IiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyb29tTmFtZSIsInZhbHVlIiwiY2FudmFzIiwiY3JlYXRlRWxlbWVudCIsImhlaWdodCIsImlubmVySGVpZ2h0Iiwid2lkdGgiLCJpbm5lcldpZHRoIiwiYm9keSIsImFwcGVuZCIsImN0eCIsImdldENvbnRleHQiLCJiZWdpblBhdGgiLCJsaW5lV2lkdGgiLCJsaW5lQ2FwIiwib24iLCJtZXNzYWdlIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJwYXJzZSIsImRhdGEiLCJjb29yZHMiLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsImxpbmVUbyIsIngiLCJ5Iiwic3Ryb2tlIiwiZSIsImNvbm5lY3QiLCJ0aGVuIiwiZGF0YUNoYW5uZWwiLCJzZW5kIiwiY2xpZW50SWQiLCJkaXNhYmxlZCIsImlubmVySFRNTCIsIm9ubG9hZCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxTQUFTQyxJQUFiLEMsQ0FBbUI7O0FBRW5CLFNBQVNDLElBQVQsR0FBZ0I7QUFDZCxNQUFJQyxPQUFPQyxpQkFBWCxFQUE4QjtBQUFBO0FBQUU7QUFDOUIsVUFBSUMsUUFBUUMsU0FBU0MsY0FBVCxDQUF3QixnQkFBeEIsQ0FBWjtBQUNBLFVBQUlDLGdCQUFnQkYsU0FBU0MsY0FBVCxDQUF3QixpQkFBeEIsQ0FBcEI7QUFDQSxVQUFJRSxPQUFPSCxTQUFTQyxjQUFULENBQXdCLE1BQXhCLENBQVg7QUFDQUosYUFBT08sT0FBUCxHQUFpQixJQUFJQyxPQUFKLEVBQWpCO0FBQ0FGLFdBQUtHLFFBQUwsR0FBZ0IsVUFBQ0MsS0FBRCxFQUFXO0FBQ3pCQSxjQUFNQyxjQUFOLEdBRHlCLENBQ0Q7QUFDekIsT0FGRDs7QUFJQVQsWUFBTVUsZ0JBQU4sQ0FBdUIsT0FBdkIsRUFBZ0MsVUFBQ0YsS0FBRCxFQUFXO0FBQ3pDLFlBQUlHLFdBQVdSLGNBQWNTLEtBQTdCO0FBQ0EsWUFBSUMsU0FBU1osU0FBU2EsYUFBVCxDQUF1QixRQUF2QixDQUFiO0FBQ0FELGVBQU9FLE1BQVAsR0FBZ0JqQixPQUFPa0IsV0FBdkI7QUFDQUgsZUFBT0ksS0FBUCxHQUFlbkIsT0FBT29CLFVBQXRCOztBQUVBLFlBQUlELFFBQVFKLE9BQU9JLEtBQW5CO0FBQ0EsWUFBSUYsU0FBU0YsT0FBT0UsTUFBcEI7O0FBRUFkLGlCQUFTa0IsSUFBVCxDQUFjQyxNQUFkLENBQXFCUCxNQUFyQjs7QUFFQSxZQUFJUSxNQUFNUixPQUFPUyxVQUFQLENBQWtCLElBQWxCLENBQVY7QUFDQUQsWUFBSUUsU0FBSjtBQUNBRixZQUFJRyxTQUFKLEdBQWdCLEVBQWhCO0FBQ0FILFlBQUlJLE9BQUosR0FBYyxPQUFkOztBQUVBcEIsZ0JBQVFxQixFQUFSLENBQVcsU0FBWCxFQUFzQixVQUFDQyxPQUFELEVBQWE7QUFDakMsY0FBSTtBQUNGQyxvQkFBUUMsR0FBUixDQUFZQyxLQUFLQyxLQUFMLENBQVdKLFFBQVFLLElBQW5CLENBQVo7QUFDQSxnQkFBSUMsU0FBU0gsS0FBS0MsS0FBTCxDQUFXSixRQUFRSyxJQUFuQixDQUFiO0FBQ0FYLGdCQUFJYSxTQUFKLEdBQWdCLDBCQUFoQjtBQUNBYixnQkFBSWMsUUFBSixDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUJsQixLQUFuQixFQUEwQkYsTUFBMUI7O0FBRUEsZ0JBQUlrQixNQUFKLEVBQVk7QUFDVlosa0JBQUlhLFNBQUosR0FBZ0IsS0FBaEI7QUFDQWIsa0JBQUllLE1BQUosQ0FBVyxDQUFDLElBQUlILE9BQU9JLENBQVosSUFBaUJwQixLQUE1QixFQUFtQ2dCLE9BQU9LLENBQVAsR0FBV3ZCLE1BQTlDO0FBQ0FNLGtCQUFJa0IsTUFBSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0QsYUFSRCxNQVNLO0FBQ0hsQixrQkFBSUUsU0FBSjtBQUNEO0FBQ0Q7QUFDRCxXQW5CRCxDQW9CQSxPQUFNaUIsQ0FBTixFQUFTO0FBQ1BaLG9CQUFRQyxHQUFSLENBQVlGLFFBQVFLLElBQXBCO0FBQ0Q7QUFDRixTQXhCRDs7QUEwQkEzQixnQkFBUW9DLE9BQVIsQ0FBZ0I5QixRQUFoQixFQUEwQitCLElBQTFCLENBQStCLFVBQUNDLFdBQUQsRUFBaUI7QUFDOUNBLHNCQUFZQyxJQUFaLENBQWlCLG9CQUFrQnZDLFFBQVF3QyxRQUEzQztBQUNELFNBRkQ7O0FBSUE3QyxjQUFNOEMsUUFBTixHQUFpQixJQUFqQjtBQUNELE9BL0NEO0FBVDRCO0FBMEQ3QixHQTFERCxNQTJESztBQUNIN0MsYUFBU2tCLElBQVQsQ0FBYzRCLFNBQWQsR0FBMEIsZ0NBQTFCO0FBQ0Q7QUFDRjs7QUFFRGpELE9BQU9rRCxNQUFQLEdBQWdCbkQsSUFBaEIiLCJmaWxlIjoiamF2YXNjcmlwdC9zZXJ2aWNlL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgc29ja2V0ID0gaW8oKTsgLy8gZG9uJ3QgbWFrZSB0aGlzIGdsb2JhbFxuXG5mdW5jdGlvbiBtYWluKCkge1xuICBpZiAod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7IC8vIGRldGVjdCBpZiB0aGVyZSBpcyB3ZWJydGMgcGVlciBjb25uZWN0aW9uIGV2ZW5cbiAgICBsZXQgZW50ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdC1idXR0b24nKTtcbiAgICBsZXQgcm9vbU5hbWVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb29tLW5hbWUtaW5wdXQnKTtcbiAgICBsZXQgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtJyk7XG4gICAgd2luZG93LmNoYW5uZWwgPSBuZXcgQ2hhbm5lbCgpO1xuICAgIGZvcm0ub25zdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIGFsbG93cyBlbnRlciB0byBiZSBjbGlja2VkIGxvbFxuICAgIH07XG5cbiAgICBlbnRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgbGV0IHJvb21OYW1lID0gcm9vbU5hbWVJbnB1dC52YWx1ZTtcbiAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgICAgbGV0IHdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgICAgbGV0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG5cbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGNhbnZhcyk7XG5cbiAgICAgIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5saW5lV2lkdGggPSAxMDtcbiAgICAgIGN0eC5saW5lQ2FwID0gJ3JvdW5kJztcblxuICAgICAgY2hhbm5lbC5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpKTtcbiAgICAgICAgICBsZXQgY29vcmRzID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKVwiO1xuICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICAgIGlmIChjb29yZHMpIHtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmVkJztcbiAgICAgICAgICAgIGN0eC5saW5lVG8oKDEgLSBjb29yZHMueCkgKiB3aWR0aCwgY29vcmRzLnkgKiBoZWlnaHQpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgLy8gY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgLy8gY3R4LmFyYyhjb29yZHMueCAqIHdpZHRoLCBjb29yZHMueSAqIGhlaWdodCwgNSwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgLy8gY3R4LmZpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vXG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjaGFubmVsLmNvbm5lY3Qocm9vbU5hbWUpLnRoZW4oKGRhdGFDaGFubmVsKSA9PiB7XG4gICAgICAgIGRhdGFDaGFubmVsLnNlbmQoXCJ3aGF0J3MgdXAgZnJvbSBcIitjaGFubmVsLmNsaWVudElkKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbnRlci5kaXNhYmxlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgfVxuICBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiWW91IGRvbid0IGhhdmUgV2ViUlRDIHN1cHBvcnQhXCI7XG4gIH1cbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW47XG4iXX0=
