'use strict';

let config = {};

config.connection = null;
config.offer = null;
config.channel = {
  ordered: false, // unreliable data channel
  maxPacketLifeTime: 500, // millis
  maxRetransmits: 0 // don't send again
};
config.constraints = {
  audio: false,
  video: {
    width: { exact: 1280 },
    height: { exact: 720 } // 720p
  }
};
