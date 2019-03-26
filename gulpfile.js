let gulp =          require('gulp');
let sass =          require('gulp-sass');
let browserSync =   require('browser-sync');
let concat =        require('gulp-concat');
let uglify =        require('gulp-uglifyjs');
let cssnano =       require('gulp-cssnano');
let rename =        require('gulp-rename');
let del =           require('del');
let img =           require('gulp-image');
let autoprefixer =  require('gulp-autoprefixer');
let notify =        require('gulp-notify');
let svgSprite =     require('gulp-svg-sprite');
let reload =        browserSync.reload;

gulp.task('svgSprite', function() {
  var config = {
    mode : {
      symbol: {
        dest: '.',
        sprite: 'svg/sprite.svg'
      }
    }
  };

  return gulp.src('app/svg/*.svg')
  .pipe(svgSprite( config ))
  .pipe(gulp.dest('app/img'));
})

gulp.task('autoprefixer', function(){
    return gulp.src('app/css/main.css')
        .pipe(cssnano())
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('app/css'))
});

gulp.task('img', function () {
  return gulp.src('./app/img/**/*')
    .pipe(img())
    .pipe(gulp.dest('app/img'));
});


gulp.task('sass', function() {
  return gulp.src('app/sass/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', notify.onError({
        message: "Error: <%= error.message %>",
        title: "Error running something"
      })))
    .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
    .pipe(gulp.dest('app/css'))
    .pipe(reload({stream:true}));
});

gulp.task('jsLibs', function() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('cssLibs', function() {

  return gulp.src([
    'node_modules/slick-carousel/slick/slick.css',
    'node_modules/normalize.css/normalize.css'
    ])
    .pipe(concat('libs.css'))
    .pipe(cssnano())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('app/css'));
});


gulp.task('server', function() {
  browserSync.init({
    server: 'app',
    notify: false
  });
});

gulp.task('clean', function() {
  return del('dist');
});

gulp.task('watch', function() {
  gulp.watch('app/sass/*.scss', gulp.series('sass'));
  gulp.watch(['app/*.html', 'app/js/*.js']).on('change', reload);
});


gulp.task('build', gulp.series('clean', 'sass', 'svgSprite', 'jsLibs','cssLibs', 'autoprefixer', function() {

  gulp.src('app/*.html')             .pipe(gulp.dest('dist'));
  gulp.src('app/css/*.css')          .pipe(gulp.dest('dist/css'));
  gulp.src('app/fonts/**/*')         .pipe(gulp.dest('dist/fonts'));
  gulp.src('app/js/**/*')            .pipe(gulp.dest('dist/js'));
  return gulp.src('app/img/**/**')    .pipe(gulp.dest('dist/img'));

}));

gulp.task('default',gulp.parallel(gulp.series('svgSprite', 'sass', 'server'), 'watch'));
