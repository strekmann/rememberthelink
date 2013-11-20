// -- module dependencies
var express = require('express'),
    path = require('path'),
    expressValidator = require('express-validator'),
    hbs = require('express-hbs'),
    momentLocale = require('./lib/middleware').momentLocale,
    setUser = require('./lib/middleware').setUser;

module.exports.boot = function(app) {
    app.passport = require('./lib/passport')(app);
    app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;

    app.configure(function(){
        // -- Parses x-www-form-urlencoded request bodies (and json)
        app.use(express.bodyParser());
        app.use(expressValidator({
            errorFormatter: function(param, msg, value) {
                var namespace = param.split('.'),
                    root = namespace.shift(),
                    formParam = root;

                while(namespace.length) {
                    formParam += '[' + namespace.shift() + ']';
                }
                return {
                    param: formParam,
                    msg: msg,
                    value: value
                };
            }
        }));
        app.use(express.methodOverride());

        app.use(app.passport.initialize());
        app.use(app.passport.session());

        app.use(app.i18n.init);
        app.use(function (req, res, next) {
            app.i18n.setLocale(app.i18n.getLocale(req));
            return next();
        });

        app.use(momentLocale);
        app.use(setUser);

        // -- Express routing
        app.use(app.router);

        app.use(express.static(path.join(__dirname, 'public')));

        app.engine('hbs', hbs.express3({
            partialsDir: path.join(__dirname, 'views', 'partials'),
            layoutsDir: path.join(__dirname, 'views', 'layouts'),
            contentHelperName: 'content'
        }));
        app.set('view engine', 'hbs');
        app.set('views', path.join(__dirname, 'views'));

        require('./lib/helpers').register(app, hbs);

        // -- 500 status
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.status(500);
            res.render('500', {
                status: err.status || 500,
                error: err.message
            });
        });

        // -- 404 status
        app.use(function(req, res, next) {
            res.status(404);
            res.render('404', {
                status: 404,
                error: 'file not found',
                url: req.url
            });
        });
    });
};
