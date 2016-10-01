'use strict';

let gulp = require('gulp');

gulp.task('vendor', function() {
  return copyFiles('node_modules/webrtc-adapter/out/adapter.js', 'src/javascript/vendor');
});

function copyFiles(source, destination) {
  return gulp.src(source).pipe(gulp.dest(destination));
}
