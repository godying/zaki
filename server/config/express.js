/**
 * Created by zhuhuawei on 16/10/21.
 */

'use strict';

var path = require("path");
var fs = require("fs");
var onFinished = require('on-finished');
var url = require('url');
var express = require('express');
var config = require('config');
var ejs = require('ejs');
var debug = require('debug')('app:' + process.pid);
var NotFoundError = require('../errors/NotFoundError');
var http_port = config.get('app.port');

module.exports = function(app) {
    app.use(require('morgan')("dev"));

    var bodyParser = require("body-parser");
    app.use(bodyParser.json({limit: '500mb'}));
    app.use(bodyParser.urlencoded());

    app.use(express.static(path.join(__dirname, '../..', 'public')));

    app.engine('html', ejs.__express);
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, '../../', 'client'));
    app.use('/oa/static', express.static('client'));

    app.use(require('compression')());
    app.use(require('response-time')());

    app.use(function (req, res, next) {
        onFinished(res, function (err) {
            debug("[%s] finished request", req.connection.remoteAddress);
        });
        next();
    });

    app.get('/', function(req, res, next) {
        console.log('根地址请求');
    });

    // Bootstrap routes（可以添加各个版本不同的路由）
    require('../routes')(app);

    // all other requests redirect to 404
    app.all("*", function (req, res, next) {
        next(new NotFoundError("404",'地址无效'));
    });

    // error handler for all the applications
    app.use(function (err, req, res, next) {
        var errorType = typeof err,
            error = err.status || 500,
            message = "Internal Server Error";

        switch (err.name) {
            case "UnauthorizedError":
                message = 'Unauthorized'
                return res.redirect(loginPath);
            case "BadRequestError":
                message = 'BadRequest';
            case "UnauthorizedAccessError":
                message = 'UnauthorizedAccess';
                return res.redirect(loginPath);
            case "NotFoundError":
                message = err.inner;
                break;
            default:
                break;
        }

        if(error === 500) {
            console.log('Server Error', err);
        }
        if(error === 404){
            return res.status(error).render('error', {layout: 'empty'});
        }else {
            return res.status(error).json(message);
        }
    });

    console.log("Creating HTTP server on port: %s", http_port);

    require('http').createServer(app).listen(http_port, function () {
        console.log("HTTP Server listening on port: %s, in %s mode", http_port, app.get('env'));
    });
};
