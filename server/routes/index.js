var ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

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
		console.log('callback from google');
		var url = req.session.returnTo || '/';
		delete req.session.returnTo;
		res.redirect(url);
	});
};
