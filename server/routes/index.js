// -- module dependencies


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
        return next(); 
    }
    res.redirect('/login');
}

module.exports = function(app) {
    app.get('/auth/google', app.passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    }), function(req, res) {
        // nop, google that-a-way ->
    });

    app.get('/auth/google/callback', app.passport.authenticate('google', {
        failureRedirect: '/login'
    }), function(req, res){
        res.redirect('/');
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/api/me', function (req, res) {
        if (req.user) {
            res.json(req.user);
        } else {
            res.json({_id: "guest", name: "Guest user", active: false});
        }
    });


    app.use(function(req, res) {
        res.sendfile('./server/public/index.html');
    });
};
