// todo: move everything into nice modules and objects!
// these random functions everywhere is not cutting it for me
// polluting that global scope >:-(

// most functions should be pretty generic and atomic
function startVideo(options) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia(options)
    .then((mediaStream) => {
      let video = document.createElement('video');
      video.src =  window.URL.createObjectURL(mediaStream);
      awaitVideoLoad(video).then(() => resolve(video));
    });
  });
}

function awaitVideoLoad(video) {
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = (event) => {
      // resolve(video);
      resolve();
    };
  });
}
