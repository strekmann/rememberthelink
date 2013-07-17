// -- module dependencies
var express     = require('express');

// -- create app
var app         = express(),
    env         = app.settings.env,

// -- import configuration
    conf        = require('./settings/config'),
    settings    = conf.settings;
conf(app, express, env);

app.conf = conf.settings;

// -- bootstrap config
require('./bootstrap').boot(app);

// -- routes
require('./routes/example')(app);


// -- exports
module.exports = app;
module.exports.conf = settings;