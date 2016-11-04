/**
 * Created by zhuhuawei on 16/10/21.
 */

'use strict';

var fs = require('fs');
var router = require('express').Router();

var paths = fs.readdirSync(__dirname);
for(var key in paths) {
    var name = paths[key].split('.')[0];
    if(name == 'index')
        continue;
    router.use('/' + name, require('./' + name));
}

module.exports = function(app) {
    app.use('/', router);
};