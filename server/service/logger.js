/**
 * Created by zxb on 8/7/15.
 */
var log4js = require('log4js');
var _ = require('lodash');

var logger = log4js.getLogger('info');
var loggerError = log4js.getLogger("error");

var DEFAULT_FORMAT = ':remote-addr - -' +
    ' ":method uri[:url] HTTP/:http-version"' +
    ' :status :content-length';

function init(config) {
    log4js.configure(config);
    return log4js.connectLogger(log4js.getLogger('info'), {
        level: log4js.levels.INFO,
        format: DEFAULT_FORMAT
    });
}

function info(value) {
    logger.info(value);
}

function error(value) {
    if(typeof(value) == 'object' && !_.isEmpty(value.stack)) {
        loggerError.error(value.stack);
    } else {
        loggerError.error(value);
    }
}

module.exports = {
    init: init,
    info: info,
    error: error
};
