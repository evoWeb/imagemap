'use strict';

import gulp from 'gulp';
import log from 'gulplog';

import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';

import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import rename from 'gulp-rename';

const paths = {
	src: './Sources',
	dest: '../Resources/Public'
};

const tasks = {
	scss: {
		src: `${paths.src}/Sass/*.scss`,
		dest: `${paths.dest}/Stylesheets/`
	},

	copy: {
		src: [`node_modules/fabric/dist/fabric.js`],
		dest: `${paths.dest}/JavaScript/vendor/`
	},

	typescript: {
		'AreaEditor.ts': {
			src: `${paths.src}/TypeScript/AreaEditor.ts`,
			dest: `${paths.dest}/JavaScript/`,
			name: 'AreaManipulation.js'
		},
		'EditControl.ts': {
			src: `${paths.src}/TypeScript/EditControl.ts`,
			dest: `${paths.dest}/JavaScript/`,
			name: 'EditControl.js'
		},
		'FormElement.ts': {
			src: `${paths.src}/TypeScript/FormElement.ts`,
			dest: `${paths.dest}/JavaScript/`,
			name: 'FormElement.js'
		}
	}
};

let stylesTask = () => {
	return gulp.src(tasks.scss.src)
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: 'compressed',
				includePaths: require('node-normalize-scss').includePaths
			}).on('error', log.error)
		)
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(tasks.scss.dest));
};

let copyTask = () => {
	return gulp.src(tasks.copy.src, { base: './node_modules/fabric/dist' })
		.pipe(rename(function(path) {
			path.basename = path.basename.substring(0, 1).toUpperCase() + path.basename.substring(1);
			return path;
		}))
		.pipe(gulp.dest(tasks.copy.dest));
};

let typescriptTask = (done) => {
	let position = process.argv.indexOf('--file'),
		file = position > -1 ? process.argv[position + 1] : null;

	let seriesTasks = [];
	Object.keys(tasks.typescript).map((key) => {
		if (file == null || file === key) {
			let localPaths = tasks.typescript[key];
			let buildJavascript = (done) => {
				let tsProject = typescript.createProject('tsconfig.json');

				gulp.src(localPaths.src)
					.pipe(tsProject())
					.js.pipe(gulp.dest(localPaths.dest));
				done();
			};
			buildJavascript.displayName = `${localPaths.name}`;

			seriesTasks.push(buildJavascript);
		}
	});

	return gulp.series(...seriesTasks, (seriesDone) => {
		seriesDone();
		done();
	})();
};

exports.scss = stylesTask;

exports.copy = copyTask;

exports.typescript = typescriptTask;

exports.build = gulp.series(stylesTask, copyTask, typescriptTask);
