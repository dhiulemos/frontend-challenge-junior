const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const postcss = require("gulp-postcss");
const rgba = require("postcss-hexrgba");
const autoprefixer = require("autoprefixer");
const cssvars = require("postcss-simple-vars");
const nested = require("postcss-nested");
const cssImport = require("postcss-import");
const mixins = require("postcss-mixins");
const colorFunctions = require("postcss-color-function");
const sass = require("gulp-sass");
const uglifycss = require("gulp-uglifycss");
const rename = require("gulp-rename");
const image = require("gulp-image");
const babel = require("gulp-babel");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const htmlmin = require("gulp-htmlmin");

gulp.task("styles", function() {
  return gulp
    .src(["src/css/style.scss"])
    .pipe(
      plumber({
        errorHandler(err) {
          notify.onError({
            title: `Gulp error in ${err.plugin}`,
            message: err.toString(),
          })(err);
        },
      })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([
        cssImport,
        mixins,
        cssvars,
        nested,
        rgba,
        colorFunctions,
        autoprefixer,
      ])
    )
    .pipe(uglifycss({ uglyComment: true }))
    .on("error", (error) => console.log(error.toString()))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./src/dist/css/"));
});

gulp.task("scripts", function() {
  return gulp
    .src("src/js/*.js")
    .pipe(
      plumber({
        errorHandler(err) {
          notify.onError({
            title: `Gulp error in ${err.plugin}`,
            message: err.toString(),
          })(err);
        },
      })
    )
    .pipe(
      babel({
        minified: true,
        comments: false,
        presets: ["@babel/preset-env"],
      })
    )
    .on("error", function(err) {
      console.log(err);
    })
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./src/dist/js"));
});

gulp.task("images", function() {
  return gulp
    .src(["src/images/**/*.png", "src/images/**/*.jpg"])
    .pipe(
      image({
        quiet: true,
        zopflipng: false,
      })
    )
    .on("error", function(err) {
      console.log(err);
    })
    .pipe(gulp.dest("./src/dist/images"));
});

gulp.task("watch", function() {
  browserSync.init({
    notify: false,
    ghostMode: false,
  });

  gulp.watch(["src/index.html"], function(cb) {
    browserSync.reload();
    cb();
  });
  gulp.watch("src/css/**.scss", gulp.parallel("waitForStyles"));
  gulp.watch(["src/js/*.js"], gulp.parallel("waitForScripts"));
});

gulp.task(
  "waitForStyles",
  gulp.series("styles", function() {
    return gulp.src("./src/dist/css/*.css").pipe(browserSync.stream());
  })
);

gulp.task(
  "waitForScripts",
  gulp.series("scripts", function(cb) {
    browserSync.reload();
    cb();
  })
);

gulp.task("pages", function() {
  return gulp
    .src(["./src/*.html"])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest("./src/dist"));
});
