/* jshint node: true */
"use strict";

let gulp = require('gulp');
let concat = require('gulp-concat');
let connect = require('gulp-connect');
let open = require('gulp-open');
let rsync = require('gulp-rsync');
let browserify = require('browserify');
let browserifyData = require('browserify-data');
let source = require('vinyl-source-stream');
let argv = require('yargs').argv;
let babel = require('babelify');

let config = {
    devPort: 9000,
    devBaseUrl: 'http://localhost',
    paths: {
        html: './src/*.html',
        mainJs: './src/main.js',
        js: [
            './src/links.example.json'
        ],
        css: [
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
            './src/main.css'
        ],
        images: './src/images/**/*',
        dist: './dist'
    }
};

gulp.task('connect', () => {
    connect.server({
        root: ['dist'],
        port: config.devPort,
        base: config.devBaseUrl,
        livereload: true
    });
});

gulp.task('open', ['connect'], () => {
    gulp.src('dist/index.html')
        .pipe(open({ uri: config.devBaseUrl + ':' + config.devPort + '/'}));
});

gulp.task('html', () => {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('images', () => {
    gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'));
});

gulp.task('css', () => {
    gulp.src(config.paths.css)
        .pipe(concat('app.css'))
        .pipe(gulp.dest(config.paths.dist + '/css'))
        .pipe(connect.reload());
});

gulp.task('js', () => {
    gulp.src(config.paths.js)
        .pipe(gulp.dest(config.paths.dist + '/js'));

    browserify(config.paths.mainJs)
        .transform(browserifyData)
        .transform(babel)
        .bundle()
        .on('error', console.error.bind(console))
        .pipe(source('app.js'))
        .pipe(gulp.dest(config.paths.dist + '/js'))
        .pipe(connect.reload());
});

gulp.task('watch', () => {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.css, ['css']);
    gulp.watch(config.paths.mainJs, ['js']);
});

gulp.task('deploy', () => {
    let settings = Object.assign({
        host: undefined,
        user: 'links',
        dest: 'httpdocs/'
    }, argv);

    if ('undefined' === typeof argv.host) {
        throw "Please specify host using --host parameter.";
    }

    gulp.src('dist/**')
        .pipe(rsync({
            root: 'dist/',
            hostname: settings.host,
            username: settings.user,
            destination: settings.dest
        }));
});

gulp.task('default', ['html', 'css', 'js', 'images', 'open', 'watch']);
