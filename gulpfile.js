'use strict'

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const browserSync = require('browser-sync').create();
const resolveUrl = require('gulp-resolve-url');
const prettify = require('gulp-jsbeautifier');
const combiner = require('stream-combiner2').obj;
const svgSprite = require('gulp-svg-sprite')

gulp.task('pug', () => {
  return combiner(
    gulp.src('frontend/pug/pages/*.pug'),
    $.pug(),
    prettify(),
    gulp.dest('public')
    
  ).on('error', $.notify.onError(function(err) {
    return {
      title: 'pug',
      message: err.message
    }
  }));
});

gulp.task('styles', () => {
  return combiner(
    gulp.src('frontend/styles/*.scss'),
    $.sourcemaps.init(),
    $.sass(),
    $.autoprefixer({
      browsers: [
        "> 1%",
        "last 2 versions",
        "ie >= 11"
      ],
      grid: true
    }),
    // .pipe($.shorthand())
    $.csso(),
    resolveUrl(),
    $.sourcemaps.write(),
    gulp.dest('public/styles')
  ).on('error', $.notify.onError(function(err) {
    return {
      title: 'styles',
      message: err.message
    }
  }));
});

gulp.task('styles:production', () => {
  return combiner(
    gulp.src('frontend/styles/*.scss'),
    $.sass(),
    $.autoprefixer({
      browsers: [
        "> 1%",
        "last 2 versions",
        "ie >= 11"
      ],
      grid: true
    }),
    // .pipe($.shorthand())
    $.csso(),
    resolveUrl(),
    gulp.dest('public/styles')
  ).on('error', $.notify.onError(function(err) {
    return {
      title: 'styles',
      message: err.message
    }
  }));
});

gulp.task('styles:libs', () => {
  return combiner(
    gulp.src('frontend/styles/libs/*.css'),
    gulp.dest('public/styles')
  ).on('error', $.notify.onError(function(err) {
    return {
      title: 'styles:libs',
      message: err.message
    }
  }));
});

gulp.task('scripts', () => {
  return combiner(
    gulp.src(['frontend/scripts/components/*.js'], {base: 'frontend'}),
    $.concat('script.js'),
    $.babel({
      presets: ['@babel/env']
    }),
    gulp.dest('public/scripts')
  ).on('error', $.notify.onError(function(err) {
    return {
      title: 'scripts',
      message: err.message
    }
  }));
});

// gulp.task('copy:styles:swiper', () => {
//   return gulp
//     .src('node_modules/swiper/dist/css/swiper.min.css', {since: gulp.lastRun('copy:styles:swiper')})
//     .pipe($.newer('public/styles'))
//     .pipe(gulp.dest('public/styles'));
// }); 

// gulp.task('copy:styles:fancybox', () => {
//   return gulp
//     .src('node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css', {since: gulp.lastRun('copy:styles:fancybox')})
//     .pipe($.newer('public/styles'))
//     .pipe(gulp.dest('public/styles'));
// });

gulp.task('copy:scripts', () => {
  return gulp
    .src('frontend/scripts/libs/**/*.*', {since: gulp.lastRun('copy:scripts')})
    .pipe($.newer('public/scripts'))
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('fonts', function() {
  return gulp
    .src('frontend/assets/fonts/*.*', {since: gulp.lastRun('fonts')})
    .pipe($.newer('public/assets/fonts'))
    .pipe(gulp.dest('public/assets/fonts'))
});

gulp.task('svgSprite', function () {
  return combiner(
    gulp.src('frontend/assets/img/icons-minificated/*.svg'), // svg files for sprite
    svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg"  //sprite file name
        },
        // symbol: true,
        inline: true,
      },
    }),
    gulp.dest('public/assets/img/icons')
  ) 
});

gulp.task('svg', function() {
  return gulp.src('frontend/assets/img/icons/*.svg', {since: gulp.lastRun('svg')})
    // .pipe($.newer('frontend/assets/img/icons-minificated'))
    .pipe($.imagemin([
      $.imagemin.svgo({
        plugins: [
          {cleanupAttrs: true},
          {inlineStyles: true},
          {removeDoctype: true},
          {removeXMLProcInst: true},
          {removeComments: true},
          {removeMetadata: true},
          {removeTitle: true},
          {removeDesc: true},
          {removeUselessDefs: true},
          {removeXMLNS: false},
          {removeEditorsNSData: true},
          {removeEmptyAttrs: true},
          {removeHiddenElems: true},
          {removeEmptyText: true},
          {emoveEmptyContainers: true},
          {removeViewBox: false},
          {cleanupEnableBackground: true},
          {minifyStyles: false},
          {convertStyleToAttrs: true},
          {convertColors: true},
          {convertPathData: true},
          {convertTransform: true},
          {removeUnknownsAndDefaults: true},
          {removeNonInheritableGroupAttrs: true},
          {removeUselessStrokeAndFill: true},
          {removeUnusedNS: true},
          {cleanupIDs: true},
          {cleanupNumericValues: true},
          {cleanupListOfValues: true},
          {moveElemsAttrsToGroup: true},
          {moveGroupAttrsToElems: true},
          {collapseGroups: true},
          {removeRasterImages: true},
          {mergePaths: true},
          {convertShapeToPath: true},
          {sortAttrs: true},
          {removeDimensions: true},
          {removeAttrs: true},
          {removeElementsByAttr: false},
          {addClassesToSVGElement: false},
          {addAttributesToSVGElement: false},
          {removeStyleElement: false},
          {removeScriptElement: false},
        ]
      })
    ]))
    .pipe(gulp.dest('frontend/assets/img/icons-minificated'));
});

gulp.task('images', function() {
  return gulp.src('frontend/assets/img/.*', {since: gulp.lastRun('images')})
    .pipe($.newer('public/assets/img'))
    .pipe($.imagemin())
    .pipe(gulp.dest('public/assets/img'));
});

gulp.task('assets',
  gulp.series('svg', 'svgSprite'),
  gulp.parallel('images', 'fonts', 'copy:scripts')
);

gulp.task('clean',() => {
  return del(['public', 'frontend/assets/img/icons-minificated']);
});

gulp.task('build', gulp.series(gulp.parallel('scripts', 'pug', 'styles', 'styles:libs', 'assets'))
);

gulp.task('build:production', gulp.series(gulp.parallel('scripts', 'pug', 'styles:production', 'styles:libs', 'assets'))
);

gulp.task('watch', function () {
  gulp.watch('frontend/scripts/**/*.js', gulp.series('scripts', 'copy:scripts'));
  gulp.watch('frontend/styles/**/*.scss', gulp.series('styles'));
  gulp.watch('frontend/styles/**/*.css', gulp.series('styles:libs'));
  gulp.watch('frontend/pug/**/*.pug', gulp.series('pug'));
  gulp.watch('frontend/assets/**/*.*', gulp.series('assets', 'pug'));
});

gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: 'public'
    }
  });
  browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));