var User = require('../models').User,
    shortid = require('short-mongo-id'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function(app){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            if (err) {
                return done(err.message, null);
            }
            if (!user) {
                return done("Could not find user "+ id);
            }
            done(null, user);
        });
    });

    passport.use(new GoogleStrategy({
            clientID: app.conf.auth.google.clientId,
            clientSecret: app.conf.auth.google.clientSecret,
            callbackURL: app.conf.auth.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({google_id: profile.id}, function(err, user){
                    if (err) {
                        return done(err.message, null);
                    }
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        user = new User({
                            _id: shortid(),
                            name: profile.displayName,
                            email: profile._json.email,
                            google_id: profile.id
                        });
                        user.save(function(err){
                            if (err) {
                                return done("Could not create user", null);
                            }
                            return done(null, user);
                        });
                    }
                });
            });
        }
    ));

    if (process.env.NODE_ENV === 'test') {
        var LocalStrategy = require('passport-local').Strategy;

        passport.use(new LocalStrategy(function (username, password, done) {
            User.findOne({username: username.toLowerCase()}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {message: 'Unrecognized username.'});
                }
                var hashedPassword = crypto.createHash(user.algorithm);
                hashedPassword.update(user.salt);
                hashedPassword.update(password);
                if (user.password === hashedPassword.digest('hex')) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Incorrect password.'});
                }
            });
        }));
    }

    return passport;
};
