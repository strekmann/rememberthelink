// -- module dependencies
var express     = require('express');

// -- create app
var app         = express(),
    env         = app.settings.env,

// -- import configuration
    conf        = require('./settings/config'),
    settings    = conf.config;

conf(app, express, env);

// -- bootstrap config
require('./bootstrap').boot(app);

// -- routes
var core_routes = require('./routes/index');
//app.get('/', core_routes.index);
app.get('/account', app.ensureAuthenticated, core_routes.account);
app.post('/account', app.ensureAuthenticated, core_routes.save_account);
app.get('/login', core_routes.login);
app.get('/logout', core_routes.logout);
app.get('/auth/google', app.passport.authenticate('google', { scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]}), function(req, res){});
app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), core_routes.google_callback);

var link_routes = require('./routes/links');

app.get('/', link_routes.index);
app.get('/new', app.ensureAuthenticated, link_routes.new_link);
app.post('/new', app.ensureAuthenticated, link_routes.create_link);
app.put('/edit', app.ensureAuthenticated, link_routes.update_link);
app.delete('/delete', app.ensureAuthenticated, link_routes.delete_link);
app.get('/tags/*', link_routes.tags);
app.post('/uwanna', link_routes.suggest);
app.get('/suggestions', link_routes.suggestions);
app.delete('/reject', app.ensureAuthenticated, link_routes.reject_suggestion);
app.post('/accept', app.ensureAuthenticated, link_routes.accept_suggestion);
app.post('/share', app.ensureAuthenticated, link_routes.share);

var friend_routes = require('./routes/friends');
app.get('/friends', app.ensureAuthenticated, friend_routes.index);
app.get('/friends/search', app.ensureAuthenticated, friend_routes.search);
app.post('/friends/add', app.ensureAuthenticated, friend_routes.add);
app.get('/friends/followers', app.ensureAuthenticated, friend_routes.followers);

// -- exports
module.exports = app;

//module.exports.conf = settings;
