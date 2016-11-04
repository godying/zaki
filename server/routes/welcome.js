/**
 * Created by zhuhuawei on 16/11/4.
 */

'use strict';

var path = require('path');
var router = require('express').Router();
var welcome = require('../middlewares/welcome');

router.get('/welcome', welcome.welcome);

module.exports = router;