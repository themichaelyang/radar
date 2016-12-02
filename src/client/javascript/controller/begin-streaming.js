function beginStreaming(channel) {

  startVideo(config.constraints).then((video) => {
    let canvas = document.createElement('canvas');
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    document.body.appendChild(canvas);

    let context = canvas.getContext('2d');

    window.setInterval(() => {
      run(context, webcam);
    }, 1000 / config.fps);

    function run(context, video) {
      let differenceMap = frameDifference(context);
      let coords = getCoordinates(differenceMap);
      channel.send(coords);
    }

  });
}
