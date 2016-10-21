/**
 * Created by zhuhuawei on 16/10/21.
 */

'use strict';

var path = require("path");
var fs = require("fs");
var onFinished = require('on-finished');
var proxy = require('proxy-middleware');
var url = require('url');
var express = require('express');
var config = require('config');
var exphbs = require('express-handlebars');

var NotFoundError = require('errors/NotFoundError');
var http_port = process.env.HTTP_PORT || config.get('app.port');

module.exports = function(app) {
    console.log("Initializing peter");
    pm_boss.bindDb(config.db.mongodb, function(error) {
        if(error) {
            console.error("pm_boss connection error");
            process.exit(1);
        } else {
            console.log("pm_boss connected to the database");
        }
    });

    pm_hfs.bindDb(config.db.hfs2db, function(error) {
        if(error) {
            console.error("pm_hfs connection error");
            process.exit(1);
        } else {
            console.log("pm_hfs connected to the database");
        }
    });

    pm_engine.bindDb(config.db.engine, function(error) {
        if(error) {
            console.error('pm_engine connnection error');
            process.exit(1);
        } else {
            console.log("pm_engine connnected to the database");
        }
    })

    app.use(require('morgan')("dev"));

    // must use cookieParser before expressSession
    app.use(cookieParser());

    var bodyParser = require("body-parser");
    app.use(bodyParser.json({limit: '500mb'}));
    app.use(bodyParser.urlencoded());

    app.use(express.static(path.join(__dirname, '../..', 'public')));

    var hbs = exphbs.create({
        cache: false,
        extname: '.hbs',
        layoutsDir: 'server/views/workflow/layouts',
        partialsDir: 'server/views/workflow/partials',
        defaultLayout: 'layout',
    });
    app.engine('.hbs', hbs.engine);
    app.set('view engine', '.hbs');
    app.set('views', path.join(__dirname, '..', 'views'));
    app.use('/oa/static', express.static('server/views'));

    app.use(require('compression')());
    app.use(require('response-time')());

    app.use(function (req, res, next) {
        onFinished(res, function (err) {
            debug("[%s] finished request", req.connection.remoteAddress);
        });
        next();
    });

    // 对于静态资源的配置 TODO:检查对于静态资源的获取是否正常
    app.use('/assets', proxy(url.parse('http://localhost:8081/assets')));

    // 使用JSON Web Token
    var jwtCheck = jwt({
        secret: config.secret,
        getToken: function fromCookie(req) {
            var tokenValue = req.cookies[tokenName];
            if(tokenValue) {
                return tokenValue;
            }
            return null;
        }
    });
    jwtCheck.unless = unless;
    var unlessPath = [
        { url: 'favicon.ico', methods: ['GET']},
        { url: 'assets', methods: ['GET']},
        { url: '/auth/login', methods: ['GET', 'POST']},
        { url: '/auth/logout', methods: ['GET', 'POST']},
        { url: '/workflow/accountExport', methods: ['GET', 'POST']},
        { url: '/business/exam/report', methods: ['POST']},
        { url: '/business/accountExport', methods: ['POST']},
        { url: '/account/alipay_notify', methods: ['POST']}
    ];
    app.use(jwtCheck.unless({
        path: unlessPath
    }));

    // 请求根路径会触发任意受保护的api，当auth不通过的时候就会被重定向到login
    // 只有root router的jwt验证走cookie，其他api的校验都走header
    app.get('/', function(req, res, next) {
        //请求根路由去做路由分发:因为是在auth后面，所以如果能路由到这里则肯定是登录成功的，则给client app
        var department = req.user.department;
        var roles = req.user.roles;
        var position = req.user.position;
        var version = req.user.version;
        var indexPage = 'workflow/views/list';

        if(!version){ //如果版本不对,强制用户退出重新登录
            res.clearCookie(tokenName);
            res.redirect('/auth/login');
        }

        switch(department) {
            case 'CEO':
            case 'BOSS平台运营组':
                if(req.user.name == '朱倩'){
                    indexPage = 'business/views/desktop';
                }
                break;
            case 'BOSS研发':
                indexPage = 'dashboard/views/boss';
                break;
            case '区域业务组':
                if('业务VP' == position || '业务VP助理' == position) {
                    indexPage = 'dashboard/views/boss';
                } else {
                    indexPage = 'business/views/desktop';
                }
                break;
            case '代理商':
                indexPage = 'business/views/desktop';
                break;
        }
        req.cookies[tokenName] ? res.render('index.hbs', {layout: 'empty', initData: indexPage}): res.redirect(loginPath);
    });

    //数据权限过滤路由
    // app.all("*", function(req, res, next){
    //     var skip = authSer.dataAuthCheck(req, unlessPath);
    //     if(skip){
    //         return next();
    //     }else{
    //         return res.status('400').json({error: -2, message: '无数据访问权限'});
    //     }
    // });

    // Bootstrap routes（可以添加各个版本不同的路由）
    require('../routes')(app);
    // ...其他版本的路由

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
}
