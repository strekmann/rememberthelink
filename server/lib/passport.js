var url = require('url'),
    Requester = require('requester'),
    requester = new Requester({debug: 1}),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function(app){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        var address = url.format(app.conf.api);
        app.conf.api.pathname = '/api/users/' + id;
        requester.get(url.format(app.conf.api), {datatype: 'json'}, function (data, err) {
            if (err) {
                return done(err.message, null);
            }
            if (!data) {
                return done("Could not find user with id: " + id);
            } else {
                // all ok
                done(null, JSON.parse(data));
            }
        });
    });

    passport.use(new GoogleStrategy({
            clientID: app.conf.auth.google.clientId,
            clientSecret: app.conf.auth.google.clientSecret,
            callbackURL: app.conf.auth.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {
                // To keep the example simple, the user's Google profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Google account with a user record in your database,
                // and return that user instead.
                var address = url.format(app.conf.api);
                //console.log(profile);
                app.conf.api.pathname = '/api/users/google/' + profile.id;
                requester.post(url.format(app.conf.api), {data: {
                    username: profile._json.given_name + "-" + profile.id,
                    name: profile.displayName,
                    email: profile._json.email,
                    link: profile._json.link,
                    picture: profile._json.picture
                }}, function (data, err) {
                    // new get or create user call that will return standardized user object
                    if (err) {
                        //console.log(err);
                        return done("Could not run user get", null);
                    }
                    //console.log(data);
                    if (data) {
                        user = JSON.parse(data);
                        return done(null, user);
                    } else {
                        return done("Something went wrong with user query", null);
                    }
                });
            });
        }
    ));

    return passport;
};