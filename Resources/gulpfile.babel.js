'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoPrefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';

const dirs = {
	src: 'Private',
	dest: 'Public'
};

const javascriptPaths = {
	src: `${dirs.src}/Scripts/*.js`,
	dest: `${dirs.dest}/JavaScript/`
};

const sassPaths = {
	src: `${dirs.src}/Sass/*.scss`,
	dest: `${dirs.dest}/Stylesheets/`
};

let stylesTask = () => {
	return gulp.src(sassPaths.src)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoPrefixer())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(sassPaths.dest));
};

let babelTask = () => {
	return gulp.src(javascriptPaths.src)
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: [
				['@babel/env', {
					modules: false
				}]
			]
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(javascriptPaths.dest));
};

exports.babel = babelTask;

exports.styles = stylesTask;

exports.default = gulp.series(babelTask, stylesTask);
