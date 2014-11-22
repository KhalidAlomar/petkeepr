var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    return gulp.src('test/unit/**/*.js', {read: false})
        .pipe(mocha({timeout: 5000}));
});

gulp.task('default', function () {
    return gulp.src('test/integration/**/*.js', {read: false})
        .pipe(mocha({timeout: 5000}));
});

// Old package.json test line:
//"test": "node ./node_modules/mocha/bin/mocha --timeout 5000 --recursive"

