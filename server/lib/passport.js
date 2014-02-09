var User = require('../models').User,
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

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
                    } else {
                        user = new User({
                            _id: profile._json.family_name + "." + profile.id,
                            username: profile._json.family_name + "." + profile.id,
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

    passport.use(new FacebookStrategy({
            clientID: app.conf.auth.facebook.clientId,
            clientSecret: app.conf.auth.facebook.clientSecret,
            callbackURL: app.conf.auth.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({facebook_id: profile.id}, function(err, user){
                    if (err) {
                        return done(err.message, null);
                    }
                    if (!user) {
                        user = new User({
                            _id: profile.name.familyName + "." + profile.id,
                            username: profile.name.familyName + "." + profile.id,
                            name: profile.displayName,
                            email: profile._json.email,
                            facebook_id: profile.id
                        });
                        user.save(function(err){
                            if (err) {
                                return done("Could not create user", null);
                            }
                        });
                    }
                    return done(null, user);
                });
            });
        }
    ));

    return passport;
};
