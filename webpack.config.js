const webpack = require('webpack');
const PROD = JSON.parse(process.env.PROD_DEV || '0');
// http://stackoverflow.com/questions/25956937/how-to-build-minified-and-uncompressed-bundle-with-webpack

module.exports = {
    entry: "./entry.js",
    devtool: "#inline-source-map",
    output: {
        // devtoolLineToLine: true,
        sourceMapFilename: "tickertags.bundle.js.map",
        pathinfo: true,
        path: __dirname + "/app/assets/js",
        filename: PROD ? "tickertags.bundle.min.js" : "tickertags.bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.html/, loader: 'html-loader' },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    compact: false,
                    cacheDirectory: true,
                    presets: ['es2015'],
                    plugins: ['transform-flow-strip-types']
                }
            }
        ]
    },
    plugins: [ ]
};