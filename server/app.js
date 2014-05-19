var express     = require('express'),
    path        = require('path'),
    settings    = require('./settings'),
    app         = require('libby')(express, settings);

// # Application setup
// Add passport to application.
app.passport = require('./lib/passport')(app);

// Use jade templates located under server/views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Initialize passport
app.use(app.passport.initialize());
app.use(app.passport.session());

// Make some variables always available in templates.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
});

// ## Application routes
// Authentication against google.
app.get('/auth/google', app.passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}), function(req, res){});
app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), function(req, res){
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

// Core routes like index, login, logout and account.
app.use('/', require('./routes/index'));

var core_routes = require('./routes/index');
app.get('/', core_routes.index);
app.get('/account', app.ensureAuthenticated, core_routes.account);
app.put('/account', app.ensureAuthenticated, core_routes.save_account);
app.get('/login', core_routes.login);
app.get('/logout', core_routes.logout);

// Static file middleware serving static files.
app.use(express.static(path.join(__dirname, 'public')));

// Internal server error - 500 status
app.use(function(err, req, res, next){
    console.error("ERR:", err.message, err.stack);
    res.status(500);
    res.format({
        html: function(){
            res.render('500', {
                error: err.message,
                status: err.status || 500
            });
        },

        json: function(){
            res.json(500, {
                error: err.message,
                status: err.status || 500
            });
        }
    });
});

// File not found - 404 status
app.use(function(req, res, next){
    res.status(404);
    res.format({
        html: function(){
            res.render('404', {
                status: 404,
                error: 'file not found',
                url: req.url
            });
        },

        json: function(){
            res.json(404, {
                status: '404',
                error: 'file not found',
                url: req.url
            });
        }
    });
});

// Export application.
module.exports = app;
