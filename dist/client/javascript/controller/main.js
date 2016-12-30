'use strict';

function main() {
  if (window.RTCPeerConnection) {
    (function () {
      // detect if there is webrtc peer connection even
      var enter = document.getElementById('connect-button');
      var roomNameInput = document.getElementById('room-name-input');
      // let form = document.getElementById('form');
      window.channel = new Channel();
      // form.onsubmit = (event) => {
      // event.preventDefault();
      // };
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

// window.onload = main;

document.addEventListener('deviceready', function () {
  if (cordova.platformId === 'ios') {
    cordova.plugins.iosrtc.registerGlobals();
  }

  main();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvY29udHJvbGxlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1haW4iLCJ3aW5kb3ciLCJSVENQZWVyQ29ubmVjdGlvbiIsImVudGVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInJvb21OYW1lSW5wdXQiLCJjaGFubmVsIiwiQ2hhbm5lbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJvb21OYW1lIiwidmFsdWUiLCJvbiIsIm1lc3NhZ2UiLCJjb25zb2xlIiwibG9nIiwiZGF0YSIsImNvbm5lY3QiLCJ0aGVuIiwiZGF0YUNoYW5uZWwiLCJzZW5kIiwiY2xpZW50SWQiLCJiZWdpblN0cmVhbWluZyIsImRpc2FibGVkIiwiYm9keSIsImlubmVySFRNTCIsImNvcmRvdmEiLCJwbGF0Zm9ybUlkIiwicGx1Z2lucyIsImlvc3J0YyIsInJlZ2lzdGVyR2xvYmFscyJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTQSxJQUFULEdBQWdCO0FBQ2QsTUFBSUMsT0FBT0MsaUJBQVgsRUFBOEI7QUFBQTtBQUFFO0FBQzlCLFVBQUlDLFFBQVFDLFNBQVNDLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQVo7QUFDQSxVQUFJQyxnQkFBZ0JGLFNBQVNDLGNBQVQsQ0FBd0IsaUJBQXhCLENBQXBCO0FBQ0E7QUFDQUosYUFBT00sT0FBUCxHQUFpQixJQUFJQyxPQUFKLEVBQWpCO0FBQ0E7QUFDRTtBQUNGO0FBQ0FMLFlBQU1NLGdCQUFOLENBQXVCLE9BQXZCLEVBQWdDLFVBQUNDLEtBQUQsRUFBVztBQUN6QyxZQUFJQyxXQUFXTCxjQUFjTSxLQUE3Qjs7QUFFQUwsZ0JBQVFNLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFVBQUNDLE9BQUQsRUFBYTtBQUNqQ0Msa0JBQVFDLEdBQVIsQ0FBWUYsUUFBUUcsSUFBcEI7QUFDRCxTQUZEOztBQUlBVixnQkFBUVcsT0FBUixDQUFnQlAsUUFBaEIsRUFBMEJRLElBQTFCLENBQStCLFVBQUNDLFdBQUQsRUFBaUI7QUFDOUNBLHNCQUFZQyxJQUFaLENBQWlCLG9CQUFrQmQsUUFBUWUsUUFBM0M7O0FBRUFDLHlCQUFlSCxXQUFmO0FBQ0QsU0FKRDs7QUFNQWpCLGNBQU1xQixRQUFOLEdBQWlCLElBQWpCO0FBQ0QsT0FkRDtBQVI0QjtBQXVCN0IsR0F2QkQsTUF3Qks7QUFDSHBCLGFBQVNxQixJQUFULENBQWNDLFNBQWQsR0FBMEIsZ0NBQTFCO0FBQ0Q7QUFDRjs7QUFFRDs7QUFFQXRCLFNBQVNLLGdCQUFULENBQTBCLGFBQTFCLEVBQXlDLFlBQU07QUFDN0MsTUFBSWtCLFFBQVFDLFVBQVIsS0FBdUIsS0FBM0IsRUFBa0M7QUFDaENELFlBQVFFLE9BQVIsQ0FBZ0JDLE1BQWhCLENBQXVCQyxlQUF2QjtBQUNEOztBQUVEL0I7QUFDRCxDQU5EIiwiZmlsZSI6ImphdmFzY3JpcHQvY29udHJvbGxlci9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbWFpbigpIHtcbiAgaWYgKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikgeyAvLyBkZXRlY3QgaWYgdGhlcmUgaXMgd2VicnRjIHBlZXIgY29ubmVjdGlvbiBldmVuXG4gICAgbGV0IGVudGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3QtYnV0dG9uJyk7XG4gICAgbGV0IHJvb21OYW1lSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vbS1uYW1lLWlucHV0Jyk7XG4gICAgLy8gbGV0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybScpO1xuICAgIHdpbmRvdy5jaGFubmVsID0gbmV3IENoYW5uZWwoKTtcbiAgICAvLyBmb3JtLm9uc3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIH07XG4gICAgZW50ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgIGxldCByb29tTmFtZSA9IHJvb21OYW1lSW5wdXQudmFsdWU7XG5cbiAgICAgIGNoYW5uZWwub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlLmRhdGEpO1xuICAgICAgfSk7XG5cbiAgICAgIGNoYW5uZWwuY29ubmVjdChyb29tTmFtZSkudGhlbigoZGF0YUNoYW5uZWwpID0+IHtcbiAgICAgICAgZGF0YUNoYW5uZWwuc2VuZChcIndoYXQncyB1cCBmcm9tIFwiK2NoYW5uZWwuY2xpZW50SWQpO1xuXG4gICAgICAgIGJlZ2luU3RyZWFtaW5nKGRhdGFDaGFubmVsKTtcbiAgICAgIH0pO1xuXG4gICAgICBlbnRlci5kaXNhYmxlZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBcIllvdSBkb24ndCBoYXZlIFdlYlJUQyBzdXBwb3J0IVwiO1xuICB9XG59XG5cbi8vIHdpbmRvdy5vbmxvYWQgPSBtYWluO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsICgpID0+IHtcbiAgaWYgKGNvcmRvdmEucGxhdGZvcm1JZCA9PT0gJ2lvcycpIHtcbiAgICBjb3Jkb3ZhLnBsdWdpbnMuaW9zcnRjLnJlZ2lzdGVyR2xvYmFscygpO1xuICB9XG5cbiAgbWFpbigpO1xufSk7XG4iXX0=
