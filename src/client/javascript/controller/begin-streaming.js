function beginStreaming(channel) {

  let constraints = {
    audio: false,
    video: {
      facingMode: 'user',
      width: {
        exact: 240
      },
      height: {
        exact: 135
      }
    }
  };

  let config = {
    fps: 30
  };

  startVideo(constraints).then((video) => {
    let videoContext = createContextFromVideo(video);
    let previousContext = createContextFromVideo(video);
    let processingContext = createContextFromVideo(video);

    let processingCanvas = processingContext.canvas;
    video.className += 'video';
    processingCanvas.className += 'video';

    document.body.appendChild(video);
    document.body.appendChild(processingContext.canvas);

    resetContexts();

    window.setInterval(() => {
      // videoContext holds the current video frame
      // processingContext holds the previous video frame
      // figure out a way to skip the first frame?

      resetContexts();
      run(videoContext, previousContext, processingContext);

    }, 1000 / config.fps);

    function run(currentContext, previousContext, processingContext) {
      frameDifference(currentContext, previousContext, processingContext);
      // let coords = getCoordinates(differenceMap);

      // channel.send("hello");
    }

    function resetContexts() {
      previousContext.drawImage(videoContext.canvas, 0, 0); // copy old frame
      copyVideoToContext(videoContext, video); // update current frame
      // processingContext.clearRect(0, 0, processingCanvas.width, processingCanvas.height); // clear processing context
      // careful: processing context might flicker
    }
  });

  function createContextFromVideo(video) {
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    return canvas.getContext('2d');
  }

  function copyVideoToContext(context, video) {
    context.drawImage(video, 0, 0, context.canvas.width, context.canvas.height);
  }
}
