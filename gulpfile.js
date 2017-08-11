var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var ga = require('gulp-ga');
var pug = require('gulp-pug');
var ghPages = require('gulp-gh-pages');

const pastProjectsEntries = [
  {
    id: 'engineer-apart',
    title: 'Engineer Apart',
    subtitle: 'Web technology consultants',
    description: 'This website!',
    preview_url: 'img/projects/project-ea.jpg',
    link: '#',
    install_ios: '',
    install_android: '',
    technologies: [ 'Pug', 'Gulp', 'jQuery', 'HTML, CSS & JS' ],
  },
  {
    id: 'rehab-guru',
    title: 'Rehab Guru',
    subtitle: '<i>Redefining exerise prescription</i>',
    description: 'Rehab Guru is dedicated to making exercise prescription painless for individuals, therapists and enterprises. RehabGuru required a complete rewrite of their legacy AngularJS website and contracted EngineerApart to rewrite their site in Angular 4 on a modern stack.',
    preview_url: 'img/projects/project-rg.jpg',
    link: 'https://rehabguru.com',
    install_ios: '',
    install_android: '',
    technologies: [ 'Angular 4', 'MongoDB', 'AWS ElasticBeanstalk', 'AWS S3',
      'CloudFront', 'Parse Server', 'Express'
    ],
  },
  {
    id: 'la-favorita',
    title: 'La Favorita Radio',
    subtitle: '<i>Northern California\'s favorite radio station</i>',
    description: 'La Favorita Radio is one of Northern California\'s most popular Mexican radio stations. Currently engaged in social network campaigns to grow their listener base, a key component of this campaign was a new mobile application for iOS and Android to extend their reach.',
    preview_url: 'img/projects/project-lfr.jpg',
    link: 'https://lafavorita.net',
    install_ios: 'https://itunes.apple.com/mx/app/la-favorita-radio/id1225009848',
    install_android: 'https://play.google.com/store/apps/details?id=com.uncommonconcept.lafavoritaradio&hl=en',
    technologies: [ 'Angular 4', 'Ionic', 'Firebase', 'AWS EC2', 'AWS S3', 'CloudFront', 'Google & Facebook Social Login' ],
  },
  {
    id: 'kwik',
    title: 'Kwik Industries',
    subtitle: 'Easy online purchasing for both customers and franchisees',
    description: 'With over 1000 stores in 8 states, Kwik Auto Parts needed a platform to manage customer and franchise ordering. We were contracted to offer React consulting and expertise to help complete the project, rebuilding the site in React from a legacy PHP/Wordpress stack.',
    preview_url: 'img/projects/project-kwik.jpg',
    link: 'https://gokwikparts.com',
    install_ios: '',
    install_android: '',
    technologies: [ 'React', 'Wordpress', 'MySQL', 'AWS EC2', 'AWS S3', 'CloudFront' ],
  },
];

// Compile LESS files from /less into /css
gulp.task('less', function () {
  return gulp.src('less/engineer-apart.less')
    .pipe(less())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function () {
  return gulp.src('css/engineer-apart.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./static/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Minify JS
gulp.task('minify-js', function () {
  var gulpSrc = gulp.src(['js/engineer-apart.js','js/location-map.js']);
  if (process.env.NODE_ENV === 'production') gulpSrc = gulpSrc.pipe(uglify());
  return gulpSrc
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./static/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Copy root assets
gulp.task('copy-root', function () {
  return gulp.src([
      './CNAME',
      './favicons/**'
    ])
    .pipe(gulp.dest('./static'));
});

// Copy img assets
gulp.task('copy-img', function () {
  return gulp.src([
      'img/**',
    ])
    .pipe(gulp.dest('./static/img'));
});

// Convert Pug template to html
gulp.task('pug', function buildHTML() {
  return gulp.src('./html/*.pug')
    .pipe(pug({
      pretty: process.env.NODE_ENV === 'development',
      locals: {
        carouselEntries: pastProjectsEntries,
      }
    }))
    .pipe(gulp.dest('./static/'));
});

// Google Analytics
gulp.task('ga', ['pug'], function () {
  return gulp.src('./static/index.html')
    .pipe(ga({
      url: 'engineerapart.com',
      uid: 'UA-104209956-1',
      anonymizeIp: false,
      sendPageView: true,
    }))
    .pipe(gulp.dest('./static/'));
});

// Run everything
gulp.task('default', ['minify-css', 'minify-js', 'copy-root', 'copy-img', 'pug', 'ga']);

// Dev build
gulp.task('build-dev', ['minify-css', 'minify-js', 'copy-root', 'copy-img', 'pug']);

// Configure the browserSync task
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: './static/'
    },
  })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'minify-css', 'minify-js', 'copy-root', 'copy-img', 'pug'], function () {
  gulp.watch('less/*.less', ['less']);
  gulp.watch('css/*.css', ['minify-css']);
  gulp.watch('js/*.js', ['minify-js']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('./html/*.pug', ['pug', browserSync.reload]);
  gulp.watch('js/**/*.js', browserSync.reload);
});

// Deploy
gulp.task('deploy', ['default'], function() {
  return gulp.src('./static/**/*')
    .pipe(ghPages({
      branch: 'master'
    }));
});