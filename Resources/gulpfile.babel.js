'use strict';

import gulp from 'gulp';
import autoPrefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

const dirs = {
	src: 'Private',
	dest: 'Public'
};

const sassPaths = {
	src: `${dirs.src}/Sass/*.scss`,
	dest: `${dirs.dest}/Stylesheets/`
};

const javascriptPaths = {
	'Fabric.js': {
		src: `node_modules/fabric/dist/fabric.js`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'Fabric.js'
	},
	'AreaEditor.es6': {
		src: `${dirs.src}/Scripts/AreaEditor.es6`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'AreaEditor.js'
	},
	'EditControl.es6': {
		src: `${dirs.src}/Scripts/EditControl.es6`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'EditControl.js'
	},
	'FormElement.es6': {
		src: `${dirs.src}/Scripts/FormElement.es6`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'FormElement.js'
	},
	'Wizard.es6': {
		src: `${dirs.src}/Scripts/Wizard.es6`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'Wizard.js'
	}
};

let stylesTask = () => {
	return gulp.src(sassPaths.src)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoPrefixer())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(sassPaths.dest));
};

let babelTask = (done) => {
	let position = process.argv.indexOf('--file'),
		file = position > -1 ? process.argv[position + 1] : null;

	let tasks = [];
	Object.keys(javascriptPaths).map((key) => {
		if (file == null || file === key) {
			let paths = javascriptPaths[key];
			let buildJavascript = () => {
				return gulp.src(paths.src)
					.pipe(sourcemaps.init())
					.pipe(concat(paths.name))
					.pipe(babel({
						compact: false,
						presets: [
							['@babel/env', {modules: false}]
						],
						plugins: [
							'@babel/plugin-proposal-class-properties'
						]
					}))
					.pipe(uglify())
					.pipe(sourcemaps.write('.'))
					.pipe(gulp.dest(paths.dest));
			};

			buildJavascript.displayName = `${paths.name}`;
			tasks.push(buildJavascript);
		}
	});

	return gulp.series(...tasks, (seriesDone) => {
		seriesDone();
		done();
	})();
};

exports.babel = babelTask;

exports.styles = stylesTask;

exports.default = gulp.series(babelTask, stylesTask);
