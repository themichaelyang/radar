'use strict';

window.addEventListener('load', function (event) {
  var location = window.location;
  var isCordova = !!window.cordova;
  var isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || isCordova;
  if (!isHTTPS) {
    window.location = 'https:' + location.href.substring(6);
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvbGliL3JlZGlyZWN0LmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImxvY2F0aW9uIiwiaXNDb3Jkb3ZhIiwiY29yZG92YSIsImlzSFRUUFMiLCJwcm90b2NvbCIsImhvc3RuYW1lIiwiaHJlZiIsInN1YnN0cmluZyJdLCJtYXBwaW5ncyI6Ijs7QUFBQUEsT0FBT0MsZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MsVUFBQ0MsS0FBRCxFQUFXO0FBQ3pDLE1BQUlDLFdBQVdILE9BQU9HLFFBQXRCO0FBQ0EsTUFBSUMsWUFBWSxDQUFDLENBQUNKLE9BQU9LLE9BQXpCO0FBQ0EsTUFBSUMsVUFBVUgsU0FBU0ksUUFBVCxLQUFzQixRQUF0QixJQUNHSixTQUFTSyxRQUFULEtBQXNCLFdBRHpCLElBRUdMLFNBQVNLLFFBQVQsS0FBc0IsV0FGekIsSUFHR0osU0FIakI7QUFJQSxNQUFJLENBQUNFLE9BQUwsRUFBYztBQUNaTixXQUFPRyxRQUFQLEdBQWtCLFdBQVdBLFNBQVNNLElBQVQsQ0FBY0MsU0FBZCxDQUF3QixDQUF4QixDQUE3QjtBQUNEO0FBQ0YsQ0FWRCIsImZpbGUiOiJqYXZhc2NyaXB0L2xpYi9yZWRpcmVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGV2ZW50KSA9PiB7XG4gIGxldCBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcbiAgbGV0IGlzQ29yZG92YSA9ICEhd2luZG93LmNvcmRvdmE7XG4gIGxldCBpc0hUVFBTID0gbG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonXG4gICAgICAgICAgICAgICAgfHwgbG9jYXRpb24uaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnXG4gICAgICAgICAgICAgICAgfHwgbG9jYXRpb24uaG9zdG5hbWUgPT09ICcxMjcuMC4wLjEnXG4gICAgICAgICAgICAgICAgfHwgaXNDb3Jkb3ZhO1xuICBpZiAoIWlzSFRUUFMpIHtcbiAgICB3aW5kb3cubG9jYXRpb24gPSAnaHR0cHM6JyArIGxvY2F0aW9uLmhyZWYuc3Vic3RyaW5nKDYpO1xuICB9XG59KTtcbiJdfQ==
