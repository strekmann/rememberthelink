// -- module dependencies
var express = require('express'),
    path    = require('path');

module.exports.boot = function(app) {
    app.configure(function(){

        // -- Parses x-www-form-urlencoded request bodies (and json)
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        
        app.use(express.cookieParser());
        app.use(express.session({
            secret: app.conf.sessionSecret
        }));

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

         // -- 404 status
        app.use(function(req, res, next) {
            res.json('404', {
                status: 404,
                error: 'file not found',
                url: req.url
            });
        });
    });
};
