// # Server application
// Express application serving requests.

var _           = require('underscore'),
    express     = require('express'),
    path        = require('path'),
    moment      = require('moment'),
    settings    = require('./settings'),
    //util        = require('./lib/util'),
    app         = require('libby')(express, settings);

// ## Configure

// Bootstrap passport.
app.passport = require('./lib/passport')(app);
// Add authentication middleware.
app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;
app.ensureAdmin = require('./lib/middleware').ensureAdmin;

app.configure(function(){
    // Set jade as template engine.
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // Initialize passport.
    app.use(app.passport.initialize());
    app.use(app.passport.session());

    // Utils middleware, adding handy functions to templates.
    app.use(function(req, res, next){
        res.locals.active_user = req.user;
        res.locals.moment = moment;
        res.locals.longdate = function (date) {
            return moment(date).format('lll');
        };
        res.locals.shortdate = function (date) {
            return moment(date).format('Do MMMM');
        };
        res.locals.displayurl = function (url) {
            return url.replace(/^\w+:\/\/(?:www\.)?/, '');
        };
        next();
    });

    // Add our routes.
    app.use(app.router);
    // Tell express to serve static files from public.
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // Error handler.
    app.use(function(err, req, res, next){
        console.error('ERR:', err.message, err.stack);
        res.status(500);
        var response = {
            error: err.message,
            status: err.status || 500
        };

        res.format({
            html: function(){
                res.render('500', response);
            },

            json: function(){
                res.json(500, response);
            }
        });
    });

    // File not found handler.
    app.use(function(req, res, next){
        res.status(404);
        var response = {
            status: 404,
            url: req.url,
            error: 'file not found'
        };

        res.format({
            html: function(){
                res.render('404', response);
            },

            json: function(){
                res.json(404, response);
            }
        });
    });
});

// ## Routes

// Core routes.
var core_routes = require('./routes/index');
app.get('/account', app.ensureAuthenticated, core_routes.account);
app.put('/account', app.ensureAuthenticated, core_routes.update_account);
app.get('/login', core_routes.login);
app.get('/logout', core_routes.logout);
app.get('/auth/google', app.passport.authenticate('google', { scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]}), function(req, res){});
app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), core_routes.oauth_callback);
app.get('/auth/facebook', app.passport.authenticate('facebook', { scope: ['email']}), function(req, res){});
app.get('/auth/facebook/callback', app.passport.authenticate('facebook', { failureRedirect: '/login' }), core_routes.oauth_callback);

// Link routes.
var link_routes = require('./routes/links');
app.get('/', link_routes.index);
app.get('/new', app.ensureAuthenticated, link_routes.new_link);
app.post('/new', app.ensureAuthenticated, link_routes.create_link);
app.get('/edit/:id', app.ensureAuthenticated, link_routes.edit_link);
app.post('/edit', app.ensureAuthenticated, link_routes.update_link);
app.delete('/delete', app.ensureAuthenticated, link_routes.delete_link);
app.get('/tags', app.ensureAuthenticated, link_routes.all_tags);
app.get('/tags/*', link_routes.tags);
app.post('/uwanna', link_routes.bot_suggest);
app.get('/suggestions', link_routes.suggestions);
app.delete('/reject', app.ensureAuthenticated, link_routes.reject_suggestion);
app.post('/accept', app.ensureAuthenticated, link_routes.accept_suggestion);
app.post('/share', app.ensureAuthenticated, link_routes.share);
app.get('/import', app.ensureAuthenticated, link_routes.import_bookmarks);
app.post('/import', app.ensureAuthenticated, link_routes.upload_bookmarks);
app.get('/export', app.ensureAuthenticated, link_routes.export_page);
app.get('/export/bookmarks', app.ensureAuthenticated, link_routes.export_bookmarks);
app.get('/export/bookmarks.json', app.ensureAuthenticated, link_routes.export_json);

// Friend routes.
var friend_routes = require('./routes/friends');
app.get('/friends', app.ensureAuthenticated, friend_routes.index);
app.get('/friends/search', app.ensureAuthenticated, friend_routes.search);
app.post('/friends/add', app.ensureAuthenticated, friend_routes.add);
app.get('/friends/followers', app.ensureAuthenticated, friend_routes.followers);
app.get('/profile/:username', app.ensureAuthenticated, friend_routes.profile);

// Admin routes.
var admin_routes = require('./routes/admin');
app.get('/admin', app.ensureAdmin, admin_routes.user_list);
app.put('/admin/permissions/:id', app.ensureAdmin, admin_routes.set_permissions);

// Export app
module.exports = app;
