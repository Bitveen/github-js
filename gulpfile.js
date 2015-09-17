var gulp   = require('gulp'),
    sass   = require('gulp-sass'),
    concat = require('gulp-concat');

gulp.task('sass', function() {
    gulp.src('./sass/style.scss')
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(gulp.dest('./public/style'));
});
gulp.task('sass:watch', function() {
    gulp.watch('./sass/*.scss', ['sass']);
});

gulp.task('scripts', function() {
    gulp.src('app/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/scripts/'));
});
gulp.task('scripts:watch', function() {
    gulp.watch('./app/*.js', ['scripts']);
});