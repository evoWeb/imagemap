'use strict';

// Common
import {src, dest, series} from 'gulp';
import fs from 'fs';
import glob from 'glob';

// JS
import typescript from 'gulp-typescript';

// CSS
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';

const paths = {
  src: './Sources',
  dest: '../Resources/Public'
};

const tasks = {
  copy: {
    src: [`node_modules/fabric/dist/fabric.js`],
    dest: `${paths.dest}/JavaScript/vendor/`
  },

  scss: {
    src: `${paths.src}/Sass/*.scss`,
    dest: `${paths.dest}/Stylesheets/`
  },

  typescript: {
    src: `${paths.src}/TypeScript/*.ts`,
    dest: `${paths.dest}/JavaScript/`,
  }
};

let stylesTask = () => {
  return src(tasks.scss.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({ outputStyle: 'compressed' })
        .on('error', console.log)
    )
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(dest(tasks.scss.dest));
};

let copyTask = () => {
  return src(tasks.copy.src, {base: './node_modules/fabric/dist'})
    .pipe(rename(function (path) {
      path.basename = path.basename.substring(0, 1).toUpperCase() + path.basename.substring(1);
      return path;
    }))
    .pipe(dest(tasks.copy.dest));
};

let typescriptTask = (done) => {
  let position = process.argv.indexOf('--file'),
    requestedFile = position > -1 ? process.argv[position + 1] : null;

  let seriesTasks = [];

  glob.sync(tasks.typescript.src + '*').map((filePath) => {
    if (fs.statSync(filePath).isDirectory()) {
      return;
    }
    if (requestedFile == null || filePath.indexOf(requestedFile) > -1) {
      let buildJavascript = (singleDone) => {
        let tsProject = typescript.createProject('./tsconfig.json');

        src(filePath)
          .pipe(tsProject())
          .js.pipe(dest(tasks.typescript.dest));
        singleDone();
      };
      buildJavascript.displayName = filePath;

      seriesTasks.push(buildJavascript);
    }
  });

  return series(...seriesTasks, function typescriptTasks (allDone) {
    allDone();
    done();
  })();
};

exports.scss = stylesTask;

exports.copy = copyTask;

exports.typescript = typescriptTask;

exports.build = series(stylesTask, copyTask, typescriptTask);
