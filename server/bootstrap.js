// -- module dependencies
var express = require('express'),
    path    = require('path'),
    expressValidator = require('express-validator'),
    hbs = require('express-hbs'),
    RedisStore = require('connect-redis')(express);;

module.exports.boot = function(app) {
    app.passport = require('./lib/passport')(app);

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

        app.use(express.cookieParser());
        app.use(express.session({
            store: new RedisStore(),
            secret: app.conf.sessionSecret
        }));

        app.use(app.passport.initialize());
        app.use(app.passport.session());

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

        require('./lib/helpers').register(hbs);


        // -- 500 status
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.render('500', {
                status: err.status || 500,
                error: err.message
            });
        });

         // -- 404 status
        app.use(function(req, res, next) {
            res.render('404', {
                status: 404,
                error: 'file not found',
                url: req.url
            });
        });
    });
};
