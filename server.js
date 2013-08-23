#!/usr/bin/env node
var app = require('./server/app'),
    http = require('http');

// -- database
var mongoose = require('mongoose');
app.db = mongoose.connect('mongodb://localhost/' + app.conf.db_name);

// -- handle node exceptions
process.on('uncaughtException', function(err){
    console.error('uncaughtException', err.message);
    console.error(err.stack);
    process.exit(1);
});

// -- start server
http.createServer(app).listen(app.conf.port, function(){
    console.log("Express server listening on port %d in %s mode", app.conf.port, app.settings.env);
});
