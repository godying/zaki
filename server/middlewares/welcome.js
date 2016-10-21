/**
 * Created by zhuhuawei on 16/10/21.
 */

function welcome(req, res) {
    res.render('index.html');
}

module.exports = {
    welcome: welcome
};