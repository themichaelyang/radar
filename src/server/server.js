'use strict';
const fs = require('fs');

function createServer(clientDirectory, options) {
  // let server = require('https').createServer(options);
  let server = require('http').createServer();
  let previousRequestDate;

  server.on('request', (request, response) => {
    let url = clientDirectory + (request.url === '/' ? '/index.html' : request.url);
    let currentDirectory = process.cwd();
    fs.readFile(currentDirectory + url, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          response.writeHead(400);
          response.end("404: Couldn't find " + url);
        }
        else {
          response.writeHead(500);
          response.end('Error loading '+ url);
          console.error(error);
        }
      }
      else {
        response.writeHead(200);
        response.end(data);
      }
    });
    let date = (new Date()).toString();
    if (!previousRequestDate || previousRequestDate !== date) {
      console.log();
      console.log('[' + date + ']');
    }
    console.log(request.method + ': ' + request.url);
    previousRequestDate = date;
  });

  return server;
}

module.exports = createServer;
