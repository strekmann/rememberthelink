// -- module dependencies
var express     = require('express');

// -- create app
var app         = express(),
    env         = app.settings.env,

// -- import configuration
    conf        = require('./settings/config'),
    settings    = conf.settings;
conf(app, express, env);

// -- bootstrap config
require('./bootstrap').boot(app);

// -- routes
var core_routes = require('./routes/index');
app.get('/', core_routes.index);
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
app.get('/links', link_routes.index);
app.get('/links/new', app.ensureAuthenticated, link_routes.new_link);
app.post('/links/new', app.ensureAuthenticated, link_routes.create_link);
app.put('/links/edit', app.ensureAuthenticated, link_routes.update_link);
app.delete('/links/delete', app.ensureAuthenticated, link_routes.delete_link);
app.get('/links/tags/*', link_routes.tags);
app.post('/links/uwanna', link_routes.suggest);
app.get('/links/suggestions', link_routes.suggestions);
app.delete('/links/reject', app.ensureAuthenticated, link_routes.reject_suggestion);
app.post('/links/accept', app.ensureAuthenticated, link_routes.accept_suggestion);

var friend_routes = require('./routes/friends');
app.get('/friends', friend_routes.index);

// -- exports
module.exports = app;
module.exports.conf = settings;
