function beginStreamingData(channel) {

  startVideo(config.constraints).then((webcam) => {
    document.body.appendChild(webcam);
    webcam.play();
    console.log('Started webcam');

    let canvas = document.createElement('canvas');
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    let context = canvas.getContext('2d');
    document.body.appendChild(canvas);

    // when testing locally, remember that out of focus tabs slow down setInterval
    // todo: improve with animation request
    window.setInterval(() => {
      run(context, webcam);
    }, 1000 / config.fps);
  });
}

function run(context, webcam) {
  context.drawImage(webcam, 0, 0, webcam.videoWidth, webcam.videoHeight);
}
