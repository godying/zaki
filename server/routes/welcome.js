/**
 * Created by zhuhuawei on 16/10/21.
 */

'use strict';

var path = require('path');
var router = require('express').Router();
var welcome = require('../middlewares/welcome');

router.get('/welcome', welcome.welcome);

module.exports = router;