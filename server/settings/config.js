var localsettings = require('../settings.js');

// -- global settings
var config = {
    siteName        : 'strekmann',
    sessionSecret   : localsettings.sessionSecret,
    uri             : 'http://localhost',
    port            : process.env.PORT || 3000,
    db_name         : process.env.DB_NAME || 'test',
    debug           : 0,
    profile         : 0,
    auth            : localsettings.auth,
    redis           : {
        host        : '127.0.0.1',
        port        : 6379
    },
    i18n            : {
        locales     : ['en', 'nb', 'zh'],
        defaultLocale: 'en'
    }
};

module.exports = function(app, express, env){
    app.conf = config;

    if (env === 'development') {
        require('./development')(app, express);
    }
    else if (env === 'production') {
        require('./production')(app, express);
    }
    else if (env === 'test') {
        require('./test')(app, express);
    }
};

module.exports.config = config;
