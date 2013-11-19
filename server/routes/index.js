var User = require('../models').User;

// core routes - base is /
module.exports.index = function(req, res) {
    res.render('index');
};

module.exports.account = function(req, res){
    res.render('account');
};

module.exports.update_account = function(req, res){
    return User.findById(req.user._id, function(err, user){
        if (err) {
            return res.json(200, {
                error: 'Could not find user'
            });
        }

        req.assert('username', 'username is required').notEmpty();
        req.assert('name', 'name is required').notEmpty();
        req.assert('email', 'valid email required').isEmail();

        req.sanitize('username').xss();
        req.sanitize('name').xss();
        req.sanitize('email').xss();

        var errors = req.validationErrors();
        if (errors) {
            return res.json(200, {
                errors: errors
            });
        }

        user.username = req.body.username;
        user.name = req.body.name;
        user.email = req.body.email;
        return user.save(function(err){
            if (err) {
                return res.json(200, {
                    errors: [
                        {
                            param: 'username',
                            msg: res.__('username is already in use'),
                            value: req.body.username
                        }
                    ]
                });
            }
            return res.json(200, {
                message: 'Changes saved'
            });
        });
    });
};

module.exports.login = function(req, res){
    res.render('login');
};

module.exports.logout = function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
};

module.exports.google_callback = function(req, res){
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
};
