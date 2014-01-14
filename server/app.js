var express     = require('express'),
    path        = require('path'),
    hbs         = require('express-hbs'),
    settings    = require('./settings'),
    app         = require('libby')(express, settings);

app.passport = require('./lib/passport')(app);
app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;

app.configure(function(){

    app.use(app.passport.initialize());
    app.use(app.passport.session());

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

    // 500 status
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500);
        res.render('500', {
            status: err.status || 500,
            error: err.message
        });
    });

    // 404 status
    app.use(function(req, res, next) {
        res.status(404);
        res.render('404', {
            status: 404,
            error: 'file not found',
            url: req.url
        });
    });
});


// routes
var core_routes = require('./routes/index');
app.get('/', core_routes.index);
app.get('/account', app.ensureAuthenticated, core_routes.account);
app.put('/account', app.ensureAuthenticated, core_routes.save_account);
app.get('/login', core_routes.login);
app.get('/logout', core_routes.logout);
app.get('/auth/google', app.passport.authenticate('google', { scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]}), function(req, res){});
app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), core_routes.google_callback);

module.exports = app;