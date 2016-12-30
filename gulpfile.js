'use strict';

let gulp = require('gulp');
let babel = require("gulp-babel");
let sourcemaps = require('gulp-sourcemaps');
let del = require('del');
let exec = require('child_process').exec;

let srcDir = 'src/';
let appDir = 'dist/';

let serverDir = 'server/';
let clientDir = 'client/';

gulp.task('watch', ['build-all'], function() {
  var watcher = gulp.watch(srcDir, ['build-js']);
  watcher.on('change', function(event) {
    console.log('File "' + event.path + '" was ' + event.type + ', running tasks...');
  });
});

gulp.task('build-all', ['copy-server', 'build-client']);
gulp.task('build-client', ['build-client-js', 'copy-html']);
gulp.task('build-client-js', () => {
  return transpileJavascript(srcDir + clientDir + '**/*.js', appDir + clientDir);
});
gulp.task('copy-server', () => {
  return copyFiles(srcDir + serverDir + '*', appDir + serverDir);
})
gulp.task('copy-html', function() {
  return copyFiles(srcDir + '**/*.html', appDir);
});
gulp.task('copy-libraries', function() {
  del(appDir+'js/vendor');
  return copyFiles('node_modules/babel-polyfill/dist/polyfill.min.js', appDir + clientDir + 'js/vendor').then(() => {
    return copyFiles('node_modules/webrtc-adapter/out/adapter.js', appDir + clientDir + 'js/vendor');
  });
});

function transpileJavascript(source, destination) { //, isProduction) {
  return gulp.src(source)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', e => {
      console.log(e.stack);
      exec('say '+e.name); // says the error name
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destination));
}

function copyFiles(source, destination) {
  return new Promise((resolve, reject) => {
    return gulp.src(source)
    .on('error', reject)
    .pipe(gulp.dest(destination))
    .on('end', resolve);
  });
}
