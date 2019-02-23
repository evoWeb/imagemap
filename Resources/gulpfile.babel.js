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

const javascriptPaths = [
	{
		src: `${dirs.src}/Scripts/FormElement.js`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'FormElement.js'
	},
	{
		src: `${dirs.src}/Scripts/Wizard.js`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'Wizard.js'
	},
	{
		src: [
			// `node_modules/fabric/dist/fabric.js`,
			`${dirs.src}/Scripts/AreaEditor.js`
		],
		dest: `${dirs.dest}/JavaScript/`,
		name: 'AreaEditor.js'
	}/*,
	{
		src: `node_modules/fabric/dist/fabric.js`,
		dest: `${dirs.dest}/JavaScript/`,
		name: 'Fabric.js'
	}*/
];

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

let babelTask = (done) => {
	let tasks = javascriptPaths.map((paths) => {
		let buildJavascript = () => {
			return gulp.src(paths.src)
				.pipe(sourcemaps.init())
				.pipe(concat(paths.name))
				.pipe(babel({
					compact: false,
					presets: [
						['@babel/env', {modules: false}]
					],
				}))
				.pipe(uglify())
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(paths.dest));
		};

		buildJavascript.displayName = `${paths.name}`;
		return buildJavascript;
	});

	return gulp.series(...tasks, (seriesDone) => {
		seriesDone();
		done();
	})();
};

exports.babel = babelTask;

exports.styles = stylesTask;

exports.default = gulp.series(babelTask, stylesTask);
