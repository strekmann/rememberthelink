// express middleware

module.exports = {
	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	ensureAuthenticated: function(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		req.session.returnTo = req.url;
		res.redirect('/login');
	}
};