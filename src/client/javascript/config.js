'use strict';

const config = {};
let aspect = 1280 / 720;
let height = 360;

config.connection = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
};
config.offer = null;
config.channel = {
  ordered: false, // unreliable data channel
  maxPacketLifeTime: 100, // millis
  maxRetransmits: 0 // don't send again
};
config.constraints = {
  audio: false,
  video: {
    facingMode: 'user',
    width: { exact: aspect * height },
    height: { exact: height } // 720p
  }
};
config.fps = 30;
