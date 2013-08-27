// -- production config
var i18n = require('i18n'),
    path = require('path');

module.exports = function(app, express){
    var RedisStore = require('connect-redis')(express);

    app.use(express.logger({
        format: 'tiny'
    }));

    app.use(express.errorHandler());

    app.use(express.cookieParser());

    app.use(express.session({
        store: new RedisStore({
            host: app.conf.redis.host,
            port: app.conf.redis.port
        }),
        secret: app.conf.sessionSecret
    }));

    i18n.configure({
        locales: app.conf.i18n.locales,
        defaultLocale: app.conf.i18n.defaultLocale,
        cookie: 'locale',
        directory: path.join(__dirname, "..", "locales"),
        extension: '.js',
        indent: "    ",
        updateFiles: false
    });

    app.i18n = i18n;
    app.use(i18n.init);
};
