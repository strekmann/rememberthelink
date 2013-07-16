var localsettings = require('../settings.js');

// -- global settings
var settings = {
    siteName        : 'strekmann',
    sessionSecret   : localsettings.sessionSecret,
    uri             : 'http://localhost',
    port            : process.env.PORT || 3100,
    debug           : 0,
    profile         : 0,
    auth            : localsettings.auth
};

module.exports = function(app, express, env){
    if ('development' === env) {
        require('./development')(app, express);
    }
    else if ('production' === env) {
        require('./production')(app, express);
    }
};

module.exports.settings = settings;

// secret key gen: cat /dev/urandom| base64 | fold -w 64
