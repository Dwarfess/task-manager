var gulp       = require('gulp'), //сonnect Gulp
	browserSync  = require('browser-sync'), //сonnect Browser Sync
	concat       = require('gulp-concat'), //сonnect gulp-concat (for concatenating)
	uglify       = require('gulp-uglifyjs'), //сonnect gulp-uglifyjs (JS compression)
	cssnano      = require('gulp-cssnano'), //connect for CSS minification
	rename       = require('gulp-rename'), //library for rename files
	del          = require('del'), //for delete files and folders
	cache        = require('gulp-cache'), // connecting the cache library
	autoprefixer = require('gulp-autoprefixer');//for automatically add prefixes


gulp.task('browser-sync', function() {
	browserSync({
		server: { //define server parameters
			baseDir: 'pablic' //directory for server - public
		},
		notify: false // disable notifications
	});
});

gulp.task('scripts', function() {
	return gulp.src([ //take all necessary libraries
		'public/libraries/angular.js',
		'public/libraries/angular-drag-and-drop-lists.js'
		])
		.pipe(concat('angular-full.min.js')) //collect them in a new file libs.min.js
		.pipe(uglify()) //compress js file
		.pipe(gulp.dest('public/libraries')); // upload to the folder public/libraries
});

gulp.task('css-libs', function() {
	return gulp.src('public/libraries/bootstrap.css')
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'})) //add suffix .min
		.pipe(gulp.dest('public/libraries'));
});

gulp.task('css', function() {
	return gulp.src('public/css/styles.css')
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'})) //add suffix .min
		.pipe(gulp.dest('public/css'));
});

gulp.task('watch', ['browser-sync', 'css-libs'], function() {
	gulp.watch('public/css/*.css');
	gulp.watch('public/*.html', browserSync.reload);
	gulp.watch('public/js/*.js', browserSync.reload);
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('build', ['clean', 'css-libs', 'css', 'scripts'], function() {

	var buildCss = gulp.src('public/css/styles.min.css')
	.pipe(gulp.dest('dist/css'))
    
    var buildImg = gulp.src('public/img/**/*')
	.pipe(gulp.dest('dist/img'))

	var buildFonts = gulp.src('public/libraries/font-awesome/**/*')
	.pipe(gulp.dest('dist/libraries/font-awesome'))
    
    var buildLibs = gulp.src([
        'public/libraries/angular-full.min.js',
        'public/libraries/bootstrap.min.css'
    ])   
	.pipe(gulp.dest('dist/libraries/'))

	var buildJs = gulp.src('public/js/*.js')
	.pipe(gulp.dest('dist/js'))
    
    var buildViews = gulp.src('public/views/*.html')
	.pipe(gulp.dest('dist/views'))

	var buildHtml = gulp.src('public/index.html')
	.pipe(gulp.dest('dist'));
    
    var buildJson = gulp.src('public/tasks.json')
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})
