// -- testing config
var i18n = require('i18n'),
    path = require('path');

module.exports = function(app, express){
    var RedisStore = require('connect-redis')(express);

    app.use(express.logger('dev'));

    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));

    app.use(express.cookieParser());

    app.use(express.session({secret:'testing-secret'}));

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
