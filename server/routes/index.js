var ensureAuthenticated = require('../lib/middleware').ensureAuthenticated,
    User = require('../models').User;

// core routes - base is /
module.exports = function(app) {
    app.get('/', function(req, res){
        res.render('index', {
            user: req.user
        });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
        res.render('account', {
            user: req.user
        });
    });

    app.post('/account', ensureAuthenticated, function(req, res){
        return User.findById(req.user._id, function(err, user){
            if (err) {
                return res.json('200', {
                    error: 'Could not find user'
                });
            }

            req.assert('username', 'required').notEmpty();
            req.assert('name', 'required').notEmpty();
            req.assert('email', 'valid email required').notEmpty().isEmail();

            var errors = req.validationErrors();
            if (errors) {
                return res.json('200', {
                    errors: errors
                });
            }

            user.username = req.body.username;
            user.name = req.body.name;
            user.email = req.body.email;
            return user.save(function(err){
                if (err) {
                    return res.json('200', {
                        error: err.message
                    });
                }
                return res.json('200', {
                    message: 'Changes saved'
                });
            });
        });
    });

    app.get('/login', function(req, res){
        res.render('login', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/auth/google', app.passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), function(req, res){});

    app.get('/auth/google/callback', app.passport.authenticate('google', {
        failureRedirect: '/login'
    }), function(req, res){
        var url = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(url);
    });
};
