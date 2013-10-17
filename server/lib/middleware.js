// express middleware
var moment = require('moment');

module.exports.ensureAuthenticated = function(req, res, next) {
    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    if (req.isAuthenticated()) { return next(); }
    req.session.returnTo = req.url;
    res.redirect('/login');
};

module.exports.ensureAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.is_admin) { return next(); }
    res.render('403');
};

module.exports.momentLocale = function (req, res, next) {
    moment.lang(req.locale);
    next();
};

module.exports.setUser = function (req, res, next) {
    if (req.user) {
        res.locals.user = req.user;
    }
    next();
};
