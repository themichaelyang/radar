function beginStreamingData(channel) {

  startVideo(config.constraints).then((webcam) => {
    document.body.appendChild(webcam);
    webcam.play();
  });
  // when testing locally, remember that out of focus tabs slow down setInterval
  //
  // improve with animation request
  // window.setInterval(() => {
  //   channel.send('hello');
  //   console.log('sent');
  // }, 1000 / 60);
}
