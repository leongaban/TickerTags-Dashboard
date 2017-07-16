"use strict";
////////////////////////////////////////////////////////////////////////////////
/**
 * @name Gulpfile
 * @desc The TickerTags dashboard taskrunner and build creator
 * @author Leon Gaban & Paulo DaRocha
 */

const gulp        = require('gulp');
const semver      = require('semver'); // https://www.npmjs.com/package/semver
const _           = require('lodash'); // https://www.npmjs.com/package/lodash
const del         = require('del'); // https://www.npmjs.com/package/del
const fs          = require('fs'); // Node file system
const bump        = require('gulp-bump'); // https://www.npmjs.com/package/gulp-bump
const concat      = require('gulp-concat'); // https://www.npmjs.com/package/gulp-concat
const gutil       = require('gulp-util'); // https://www.npmjs.com/package/gulp-util
const gulpif      = require('gulp-if'); // https://www.npmjs.com/package/gulp-if
const htmlReplace = require('gulp-html-replace'); // https://www.npmjs.com/package/gulp-html-replace
const notify      = require("gulp-notify"); // https://www.npmjs.com/package/gulp-notify
const runSequence = require('run-sequence'); // https://www.npmjs.com/package/run-sequence
const sass        = require('gulp-ruby-sass'); // https://www.npmjs.com/package/gulp-ruby-sass
const sourcemaps  = require('gulp-sourcemaps'); // https://www.npmjs.com/package/gulp-sourcemaps
const stripDebug  = require('gulp-strip-debug'); // https://www.npmjs.com/package/gulp-strip-debug
const uglify      = require('gulp-uglify'); // https://www.npmjs.com/package/gulp-uglify
const ngConfig    = require('gulp-ng-config'); // https://www.npmjs.com/package/gulp-ng-config
const webpack     = require('webpack-stream'); // https://www.npmjs.com/package/webpack-stream
const prompt      = require('gulp-prompt');

const getPackageJson = () => JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const minifiedApp = 'tickertags.bundle.min.js';
const rootPath = process.cwd();
const env = process.env.V; // V={version number} ie: V=1.0.1 gulp build
let version = '';
let versionType = 'patch';

const paths = {
    scripts: [
        'app/api/*js',
        'app/activity/*js',
        'app/analytics/*.js',
        'app/auth/*.js',
        'app/chart/**/*.js',
        'app/config/*.js',
        'app/constant/*.js',
        'app/container/*.js',
        'app/dash/*.js',
        'app/feed/**/*.js',
        'app/platform_header/**/*.js',
        'app/portfolios/**/*.js',
        'app/search/*.js',
        'app/session/*.js',
        'app/settings/*.js',
        'app/shared/**/*js',
        'app/social/**/**/*.js',
        'app/tags/**/**/*.js',
        'app/tickers/**/**/*.js',
        'app/timespan/*.js',
        'app/unread/*.js',
        'app/view_header/*.js',
        'app/*.js'],

    bundle: ['app/assets/js/tickertags.bundle.js'],

    srcTemplates: ['app/**/*.html', 'app/**/**/*.html', 'app/dashboard.html', '!app/index.html'],

    destPartials: 'app/templates/',

    vendors: [
        'bower_components/angularjs/angular.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-cookies/angular-cookies.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-scroll/angular-scroll.min.js',
        'bower_components/angular-ui-mask/dist/mask.min.js',
        'bower_components/angular-websocket/dist/angular-websocket.min.js',
        'bower_components/canvg/dist/canvg.bundle.min.js',
        'bower_components/es6-shim/es6-shim.min.js',
        'bower_components/highcharts/highstock.js',
        'bower_components/highcharts/modules/exporting.js',
        'bower_components/highcharts-ng/dist/highcharts-ng.min.js',
        'bower_components/highcharts-export-csv/export-csv.js',
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/ng-csv/build/ng-csv.min.js',
        'bower_components/moment/min/moment.min.js',
        'bower_components/lodash/dist/lodash.min.js',
        'bower_components/ramda/dist/ramda.min.js',
        'bower_components/angular-busy/dist/angular-busy.min.js',
        'custom_components/jquery-ui/jquery-ui-custom.js',
        'custom_components/newrelic/newrelic.min.js']
};

const errorlog = (err) => {
    gutil.log(gutil.colors.red.bold.inverse('  ERROR: '+err));
    this.emit('end');
};

const setEnvConstants = (environ) => ngConfig('tickertags-config', { wrap: "module.exports = <%= module%>", environment: environ });

const printNextVersion = (ver, type) => {
    process.stdout.write(gutil.colors.blue.bold        ('############################################################     \n'));
    process.stdout.write(gutil.colors.blue.bold.inverse('           Building Dashboard '+type+' version '+ver+'         \n'));
    process.stdout.write(gutil.colors.green.italic     ('               All change is detectable                    \n'));
    process.stdout.write(gutil.colors.blue.bold        ('############################################################     \n'));
};

// Build tasks chain ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
gulp.task('build', (cb) => {
    runSequence(
        'env:prod',                 // Sets production environment
        'webpack',                  // Creates a new bundle
        'version',                  // Save new version
        // 'build:vendors',
        'build:del-assets-static',  // Delete old static folder in app/assets
        'build:move-files',         // Move files into new static folder
        'build-app-css',            // Minify and concat app styles
        'build-concat-bundle',      // Concats app
        'build:copy',               // Deletes old build folder
        'build:remove',             // Copy then Remove unneeded assets from build
        'build:version',            // Move assets into versioned build folder
        'build:index',              // Replace scripts in index.html
        'build:final-clean',
        'env:local',cb);   // Remove app.min.js from build folder
});

gulp.task('build-prod', (cb) => {
    runSequence(
        'env:prod',                 // Sets production environment
        'webpack',                  // Creates a new bundle
        'version',                  // Save new version
        'build:vendors',
        'build:del-assets-static',  // Delete old static folder in app/assets
        'build:move-files',         // Move files into new static folder
        'build-app-css',            // Minify and concat app styles
        'build-min-bundle',         // Minifies & removes logs
        'build:copy',               // Deletes old build folder
        'build:remove',             // Copy then Remove unneeded assets from build
        'build:version',            // Move assets into versioned build folder
        'build:index',              // Replace scripts in index.html
        'build:final-clean',
        'env:local',cb);   // Remove app.min.js from build folder
});

gulp.task('env:local', () => gulp.src('config_module.json').pipe(setEnvConstants('local')).pipe(gulp.dest('./app/config')));

gulp.task('env:prod', () => gulp
  .src('config_module.json')
  .pipe(prompt.confirm({
      message:'Are you sure you mean [production] instead of [local] endpoints? (y/N) ',
      default:false
  }))
  .pipe(setEnvConstants('prod'))
  .pipe(gulp.dest('./app/config')));

gulp.task('env:dev', () => gulp.src('config_module.json').pipe(setEnvConstants('dev')).pipe(gulp.dest('./app/config')));

// Task to generate new version number \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('version', ['bump'], () => {
    // reget package
    const pkg = getPackageJson();
    // increment version
    version = semver.inc(pkg.version, versionType);
    // process.stdout.write(gutil.colors.red.inverse(' Building '+versionType+' version \n'));
    return printNextVersion(version, versionType);
});

// Task to concatenate the vendor libraries \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:vendors', () => {
    // process.stdout.write(gutil.colors.white.inverse(' Uglifying & Concatenating the vendor files:           \n'));
    // _.each(paths.vendors, vendor => {
    //     process.stdout.write(gutil.colors.yellow('  '+vendor+'\n'));
    // });
    return gulp.src(paths.vendors)
        // .pipe(uglify())
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest('./app/assets/js/libs/'));
});

// Task delete old app/assets/static folder \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:del-assets-static', ['build:move-files'], (cb) => { del(['app/assets/static/'], cb); });

// Task to move files into static folder \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:move-files', () => gulp.src('app/assets/files/*').pipe(gulp.dest('app/assets/static/')) );


// Preprocess SASS into CSS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build-app-css', () => sass('sass-smacss/sass/dashboard.scss', { style: 'compressed' }).on('error', errorlog).pipe(gulp.dest('app/assets/css/')) );

// Compile the Angular modules into the final minified bundle \\\\\\\\\\\\\\\\\\
gulp.task('build-concat-bundle', () => {
    process.stdout.write(gutil.colors.white.inverse(' Compiled tickertags.bundle.js contains these modules: \n'));
    _.each(paths.scripts, (script) => {
        process.stdout.write(gutil.colors.yellow('  '+script+'\n'));
    });
    return gulp.src(paths.bundle)
        // .pipe(uglify())
        // .pipe(stripDebug())
        .on('error', errorlog)
        .pipe(concat(minifiedApp))
        .pipe(gulp.dest('app/assets/js'));
});

// Compile the Angular modules into the final minified bundle \\\\\\\\\\\\\\\\\\
gulp.task('build-min-bundle', () => {
    process.stdout.write(gutil.colors.white.inverse(' Compiled tickertags.bundle.js contains these modules: \n'));
    _.each(paths.scripts, (script) => {
        process.stdout.write(gutil.colors.yellow('  '+script+'\n'));
    });
    return gulp.src(paths.bundle)
        .pipe(uglify({ mangle: false }))
        .pipe(stripDebug())
        .on('error', errorlog)
        .pipe(concat(minifiedApp))
        .pipe(gulp.dest('app/assets/js'));
});

// Task to create build directory for all files \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:copy', ['build:cleanfolder'], () => gulp.src('app/**').pipe(gulp.dest('build/')) );

// Clear out all files and folders from build folder \\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:cleanfolder', (cb) => { del(['build/**'], cb); });

// Task to remove unwanted build folders & files \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:remove', ['build:copy'], (cb) => {
    del([
        'build/app.js',
        'build/run.js',
        'build/activity/',
        'build/analytics/',
        'build/auth/',
        'build/chart/',
        'build/config/',
        'build/constant',
        'build/container',
        'build/dash/',
        'build/feed/',
        'build/platform_header/',
        'build/portfolios/',
        'build/search/',
        'build/session',
        'build/settings',
        'build/shared/',
        'build/social/',
        'build/tags/',
        'build/templates/',
        'build/tickers/',
        'build/timespan/',
        'build/unread/',
        'build/view_header/'
    ], cb);
});

// Task to remove original assets copies assets into versioned folder first \\\\
gulp.task('build:version', ['build:assets'], (cb) => {
    del([
        'build/assets/css/',
        'build/assets/files/',
        'build/assets/fonts/',
        'build/assets/imgs/',
        'build/assets/js/'
    ], cb);
});

// Task to move assets into versioned folder \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:assets', () => gulp.src('build/assets/**').pipe(gulpif(env != '', gulp.dest('build/assets/'+version))) );

// Task to make the index file production ready \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:index', () => {
    process.stdout.write(gutil.colors.white.inverse(' New asset paths in markup:                           \n'));
    process.stdout.write(gutil.colors.yellow('  assets/'+version+'/css/dashboard.css\n'));
    process.stdout.write(gutil.colors.yellow('  assets/'+version+'/js/libs/vendors.min.js\n'));
    process.stdout.write(gutil.colors.yellow('  assets/'+version+'/js/'+minifiedApp+'\n'));

    gulp.src('app/index.html')
        .pipe(htmlReplace({
            'app-css'   : 'assets/'+version+'/css/dashboard.css',
            'vendors'   : 'assets/'+version+'/js/libs/vendors.min.js',
            'bundle-js' : 'assets/'+version+'/js/'+minifiedApp
        }))
        .pipe(gulp.dest('build/'))
        .pipe(notify('Dashboard Build '+version+' created!'));
});

gulp.task('build:final-clean', (cb) => {
    del([
        'app/assets/static',
        'build/assets/'+version+'/files',
        'build/assets/'+version+'/css/maps',
        'build/assets/'+version+'/static',
        'build/assets/'+version+'/js/libs/angular-animate',
        'build/assets/'+version+'/js/libs/angular-bootstrap',
        'build/assets/'+version+'/js/libs/angular-sanitize',
        'build/assets/'+version+'/js/libs/angular-scroll',
        'build/assets/'+version+'/js/libs/angular-ui-router',
        'build/assets/'+version+'/js/libs/angularjs',
        'build/assets/'+version+'/js/libs/es6-shim',
        'build/assets/'+version+'/js/libs/lodash',
        'build/assets/'+version+'/js/libs/highcharts-ng',
        'build/assets/'+version+'/js/libs/jquery',
        'build/assets/'+version+'/js/libs/ng-csv',
        'build/assets/'+version+'/js/tickertags.bundle.js',
        'build/assets/'+version+'/js/tickertags.bundle.js.map',
        'build/assets/'+version+'/js/app.min.js'
    ], cb);

    process.stdout.write(gutil.colors.blue.bold   ('######################################################     \n'));
    process.stdout.write(gutil.colors.blue.inverse('               Build '+version+' created!                 \n'));
    process.stdout.write(gutil.colors.blue.bold   ('######################################################     \n'));
});

// Main Gulp Tasks /////////////////////////////////////////////////////////////
gulp.task('webpack', () => {
    return gulp.src('entry.js')
        .pipe(webpack( require('./webpack.config.js') ))
        // .pipe(sourcemaps.init())
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('app/assets/js'));
});

// Main Styles /////////////////////////////////////////////////////////////////
gulp.task('app-css', () => {
    return sass('sass-smacss/sass/dashboard.scss', { style: 'compressed' })
        .pipe(sourcemaps.init())
        .on('error', errorlog)
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('app/assets/css/'));
});

// Development watch /////////////////////////////////////////////////////////// 🤖☕️⏎→
gulp.task('watch', () => {
    // gulp.watch('app/**/**/*.html', []).on('change', (file) => {
    //     const filePath = file.path.split(rootPath);
    // });

    // gulp.watch('app/assets/imgs/*.svg').on('change', (file) => {
    //     const filePath = file.path.split(rootPath);
    // });

    gulp.watch('sass-smacss/sass/**/*.scss', ['app-css']).on('change', (file) => {
        const filePath = file.path.split(rootPath);
        console.log('filePath', filePath);
    });

    // gulp.watch(paths.scripts, ['webpack']).on('change', (file) => {
    //     const filePath = file.path.split(rootPath);
    // });
});

gulp.task('bump', () => {
    gulp.src('./package.json').pipe(bump({ key: "version", type: versionType })).pipe(gulp.dest('./'));
});

gulp.task('bump:minor', () => {
    versionType = 'minor';
    gulp.src('./package.json').pipe(bump({ key: "version", type: 'minor' })).pipe(gulp.dest('./'));
});

gulp.task('bump:major', () => {
    versionType = 'major';
    gulp.src('./package.json').pipe(bump({ key: "version", type: 'major' })).pipe(gulp.dest('./'));
});

// gulp.task('default', ['app-css','webpack','watch']);
gulp.task('default', ['app-css', 'watch']);
