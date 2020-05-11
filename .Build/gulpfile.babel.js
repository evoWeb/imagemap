'use strict';

// Common
import {src, dest, series} from 'gulp';

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

let typescriptTask = () => {
  let tsProject = typescript.createProject('./tsconfig.json');

  return src(tasks.typescript.src + '*')
    .pipe(tsProject())
    .pipe(dest(tasks.typescript.dest));
};

exports.scss = stylesTask;

exports.copy = copyTask;

exports.typescript = typescriptTask;

exports.build = series(stylesTask, copyTask, typescriptTask);
