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

    // maybe
    // // not displayed
    // let processingCanvas = document.createElement('canvas');
    // processingCanvas.width = canvas.width
    // processingCanvas.height = canvas.height;
    // let processingContext = processingCanvas.getContext('2d');

    // when testing locally, remember that out of focus tabs slow down setInterval
    // todo: improve with animation request
    window.setInterval(() => {
      run(context, processingContext, webcam);
    }, 1000 / config.fps);
  });
}

function run(context, video) {
  process(context, video);
}
