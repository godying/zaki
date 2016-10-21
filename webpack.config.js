'use strict';

var webpack = require('webpack');
var path = require('path');
var config = require('config');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

module.exports = {
    cache: true,
    node: { fs: "empty" },
    entry: {
        common: [
            'jquery', 'underscore', 'moment', 'backbone', 'marionette', 'handlebars'
        ],
        bundle: [
            'bootstrap-webpack!./bootstrap.config.js',
            'webpack-dev-server/client?http://' + config.get('debug.host') + ':' + config.get('debug.port'),
            'webpack/hot/dev-server',
            './client/main.js'
        ]
    },
    preLoaders: [
        {
            test: /\.js$/,
            loader: "source-map-loader"
        }
    ],
    output: {
        path: __dirname + '/public/assets',
        publicPath: '/assets/',
        filename: '[name]-[chunkhash:8].js',
        chunkFilename: "chunk/[chunkhash].chunk.js"
    },
    devtool: 'source-map',
    resolve: {
        root: __dirname,
        noParse: ['server', 'public', 'docs', 'scripts', 'logs', 'pdf', 'temp', 'test', 'config'],
        modulesDirectories: ['client', 'node_modules'],
        alias: {
            'marionette': 'backbone.marionette/lib/backbone.marionette'
        },
        extensions: ['', '.js', '.css', '.scss', '.less'],
    },
    plugins: [
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'jquery': 'jquery',
            'Marionette': 'marionette',
            'moment': 'moment',
            'Handlebars': 'handlebars',
            '_': 'lodash',
            'underscore': 'lodash',
            'Backbone': 'backbone'
        }),
        new webpack.HotModuleReplacementPlugin({ multiStep: true }),
        new webpack.optimize.CommonsChunkPlugin('common', 'common-[hash:8].js'),
        new HtmlWebpackPlugin({
            title: '云校业务支持平台',
            template: 'index.html',
            inject: 'body',
            filename: '../../server/views/index.hbs',
            favicon: 'favicon.ico',
            cache: true,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin()
    ],
    externals: {
        handsontable: 'Handsontable'
    },
    module: {
        loaders: [
            {test: /\.js[x]?$/, loader: 'babel-loader', include: path.join(__dirname, 'client')},
            {test: /\.hbs$/, loader: "handlebars-loader"},
            {test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery'},
            {test: /\.scss$/, loaders: ['style', 'css', 'sass']},
            {test: /\.css$/, loaders: ['style', 'css']},
            {test: /\.less$/, loaders: ['style', 'css', 'less']},
            {test: /\.json$/, loaders: ['json']},
            {test: /\.png$/, loader: 'url?limit=8192&mimetype=image/png'},
            {test: /\.jpe?g$/, loader: 'url?limit=8192&mimetype=image/jpg'},
            {test: /\.gif$/, loader: 'url?limit=8192&mimetype=image/gif'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=image/svg+xml'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff2'},
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.md$/, loaders: ['html', 'markdown']}
        ]
    }
};
