'use strict';

function main() {
  if (window.RTCPeerConnection) {
    (function () {
      // detect if there is webrtc peer connection even
      var enter = document.getElementById('connect-button');
      var roomNameInput = document.getElementById('room-name-input');
      var form = document.getElementById('form');
      window.channel = new Channel();
      form.onsubmit = function (event) {
        event.preventDefault();
      };
      enter.addEventListener('click', function (event) {
        var roomName = roomNameInput.value;

        channel.on('message', function (message) {
          console.log(message.data);
        });

        channel.connect(roomName).then(function (dataChannel) {
          dataChannel.send("what's up from " + channel.clientId);

          beginStreaming(dataChannel);
        });

        enter.disabled = true;
      });
    })();
  } else {
    document.body.innerHTML = "You don't have WebRTC support!";
  }
}

window.onload = main;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvY29udHJvbGxlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1haW4iLCJ3aW5kb3ciLCJSVENQZWVyQ29ubmVjdGlvbiIsImVudGVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInJvb21OYW1lSW5wdXQiLCJmb3JtIiwiY2hhbm5lbCIsIkNoYW5uZWwiLCJvbnN1Ym1pdCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJhZGRFdmVudExpc3RlbmVyIiwicm9vbU5hbWUiLCJ2YWx1ZSIsIm9uIiwibWVzc2FnZSIsImNvbnNvbGUiLCJsb2ciLCJkYXRhIiwiY29ubmVjdCIsInRoZW4iLCJkYXRhQ2hhbm5lbCIsInNlbmQiLCJjbGllbnRJZCIsImJlZ2luU3RyZWFtaW5nIiwiZGlzYWJsZWQiLCJib2R5IiwiaW5uZXJIVE1MIiwib25sb2FkIl0sIm1hcHBpbmdzIjoiOztBQUFBLFNBQVNBLElBQVQsR0FBZ0I7QUFDZCxNQUFJQyxPQUFPQyxpQkFBWCxFQUE4QjtBQUFBO0FBQUU7QUFDOUIsVUFBSUMsUUFBUUMsU0FBU0MsY0FBVCxDQUF3QixnQkFBeEIsQ0FBWjtBQUNBLFVBQUlDLGdCQUFnQkYsU0FBU0MsY0FBVCxDQUF3QixpQkFBeEIsQ0FBcEI7QUFDQSxVQUFJRSxPQUFPSCxTQUFTQyxjQUFULENBQXdCLE1BQXhCLENBQVg7QUFDQUosYUFBT08sT0FBUCxHQUFpQixJQUFJQyxPQUFKLEVBQWpCO0FBQ0FGLFdBQUtHLFFBQUwsR0FBZ0IsVUFBQ0MsS0FBRCxFQUFXO0FBQ3pCQSxjQUFNQyxjQUFOO0FBQ0QsT0FGRDtBQUdBVCxZQUFNVSxnQkFBTixDQUF1QixPQUF2QixFQUFnQyxVQUFDRixLQUFELEVBQVc7QUFDekMsWUFBSUcsV0FBV1IsY0FBY1MsS0FBN0I7O0FBRUFQLGdCQUFRUSxFQUFSLENBQVcsU0FBWCxFQUFzQixVQUFDQyxPQUFELEVBQWE7QUFDakNDLGtCQUFRQyxHQUFSLENBQVlGLFFBQVFHLElBQXBCO0FBQ0QsU0FGRDs7QUFJQVosZ0JBQVFhLE9BQVIsQ0FBZ0JQLFFBQWhCLEVBQTBCUSxJQUExQixDQUErQixVQUFDQyxXQUFELEVBQWlCO0FBQzlDQSxzQkFBWUMsSUFBWixDQUFpQixvQkFBa0JoQixRQUFRaUIsUUFBM0M7O0FBRUFDLHlCQUFlSCxXQUFmO0FBQ0QsU0FKRDs7QUFNQXBCLGNBQU13QixRQUFOLEdBQWlCLElBQWpCO0FBQ0QsT0FkRDtBQVI0QjtBQXVCN0IsR0F2QkQsTUF3Qks7QUFDSHZCLGFBQVN3QixJQUFULENBQWNDLFNBQWQsR0FBMEIsZ0NBQTFCO0FBQ0Q7QUFDRjs7QUFFRDVCLE9BQU82QixNQUFQLEdBQWdCOUIsSUFBaEIiLCJmaWxlIjoiamF2YXNjcmlwdC9jb250cm9sbGVyL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBtYWluKCkge1xuICBpZiAod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7IC8vIGRldGVjdCBpZiB0aGVyZSBpcyB3ZWJydGMgcGVlciBjb25uZWN0aW9uIGV2ZW5cbiAgICBsZXQgZW50ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdC1idXR0b24nKTtcbiAgICBsZXQgcm9vbU5hbWVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb29tLW5hbWUtaW5wdXQnKTtcbiAgICBsZXQgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtJyk7XG4gICAgd2luZG93LmNoYW5uZWwgPSBuZXcgQ2hhbm5lbCgpO1xuICAgIGZvcm0ub25zdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfTtcbiAgICBlbnRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgbGV0IHJvb21OYW1lID0gcm9vbU5hbWVJbnB1dC52YWx1ZTtcblxuICAgICAgY2hhbm5lbC5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UuZGF0YSk7XG4gICAgICB9KTtcblxuICAgICAgY2hhbm5lbC5jb25uZWN0KHJvb21OYW1lKS50aGVuKChkYXRhQ2hhbm5lbCkgPT4ge1xuICAgICAgICBkYXRhQ2hhbm5lbC5zZW5kKFwid2hhdCdzIHVwIGZyb20gXCIrY2hhbm5lbC5jbGllbnRJZCk7XG5cbiAgICAgICAgYmVnaW5TdHJlYW1pbmcoZGF0YUNoYW5uZWwpO1xuICAgICAgfSk7XG5cbiAgICAgIGVudGVyLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiWW91IGRvbid0IGhhdmUgV2ViUlRDIHN1cHBvcnQhXCI7XG4gIH1cbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW47XG4iXX0=
