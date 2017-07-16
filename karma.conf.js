// Karma configuration
// Generated on Mon Mar 14 2016 12:10:16 GMT-0500 (CDT)


const webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};

module.exports = function(karma) {

    karma.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '.',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-stub-promise', 'sinon-chai', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'app/assets/js/vendors.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'bower_components/angular-websocket/dist/angular-websocket-mock.js',
            'app/assets/js/tickertags.bundle.js',
            'test/alert/*.spec.js'
            // 'test/feed/*.spec.js',
        ],

        // list of files to exclude
        exclude: [
            // 'app/assets/js/libs/es6-shim.map',
            // 'app/assets/js/tickertags.bundle.js.map'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // 'app/assets/js/tickertags.bundle.js': ['webpack'],
            'test/**/*.js': ['babel']
        },
        babelPreprocessor: {
            options: {
                presets: ['es2015'],
                sourceMap: 'inline'
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            noInfo: true
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],

        specReporter: {
            maxLogLines: 5,         // limit number of lines logged per test
            suppressErrorSummary: false,  // do not print error summary
            suppressFailed: false,  // do not print information about failed tests
            suppressPassed: false,  // do not print information about passed tests
            suppressSkipped: true,  // do not print information about skipped tests
            showSpecTiming: false // print the time elapsed for each spec
        },

        htmlReporter: {
            outputDir: 'karma_html', // where to put the reports
            templatePath: null, // set if you moved jasmine_template.html
            focusOnFailures: true, // reports show failures on start
            namedFiles: false, // name files instead of creating sub-directories
            pageTitle: null, // page title for reports; browser info by default
            urlFriendlyName: false, // simply replaces spaces with _ for files/dirs
            reportName: 'report-summary-filename' // report summary filename; browser info by default
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: karma.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
