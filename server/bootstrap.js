// -- module dependencies
var express = require('express'),
    path    = require('path');

module.exports.boot = function(app) {
    app.passport = require('./modules/passport')(app);

    app.configure(function(){

        // -- Parses x-www-form-urlencoded request bodies (and json)
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        
        app.use(express.cookieParser());
        app.use(express.session({
            secret: app.conf.sessionSecret
        }));

        app.use(app.passport.initialize());
        app.use(app.passport.session());

        // -- Express routing
        app.use(app.router);

        app.use(express.static(path.join(__dirname, 'public')));
        
        // -- 500 status
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.json('500', {
                status: err.status || 500,
                error: err.message
            });
        });
    });
};
