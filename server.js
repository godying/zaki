/**
 * Created by zhuhuawei on 16/10/21.
 */

'use strict';

var express = require('express');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('config');

var webpackConfig = require('./webpack.config');

var port = config.get('debug.port');
var host = config.get('debug.host');

var app = express();

if(process.env.NODE_ENV === 'development') {
    new WebpackDevServer(webpack(webpackConfig), {
        contentBase: webpackConfig.output.path,
        publicPath: webpackConfig.output.publicPath,
        hot: true,
        inline: true,
        noInfo: false,
        quiet: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With'
        },
        stats: {
            colors: false
        }
    }).listen(port, host, function(error) {
        if (error) {
            console.log('webpack-dev-server start failed:', error);
        } else {
            console.log('webpack-dev-server start success.');
        }
    });
}

// Bootstrap application settings
require('./server/config/express')(app);

