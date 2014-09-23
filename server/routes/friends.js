var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    User = require('../models').User,
    Link = require('../models/links').Link,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

router.use(ensureAuthenticated);

router.route('/')
.get(function (req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.user._id)
            .select('name following followers')
            .populate('followers', 'name')
            .populate('following', 'name')
            .exec(function(err, user){
                callback(err, user);
            });
        },
        count: function(callback){
            User.count().exec(function(err, count){
                callback(err, count);
            });
        }
    }, function(err, results){
        res.render('friends/index', {
            active_user: results.user,
            user_count: results.count
        });
    });
})
.post(function (req, res, next) {
    User
    .findOne()
    .or([{'username': req.body._id}, {'_id': req.body._id}])
    .exec(function (err, user) {
        if (err) { return next(err); }
        if (!user) {
            return res.status(404).json({error: res.locals.__("User not found")});
        }
        if (_.contains(req.user.following, user._id)) {
            return res.status(409).json({error: res.locals.__("User already added")});
        }
        async.parallel({
            following: function (callback) {
                req.user.following.addToSet(user._id);
                req.user.save(function (err) {
                    callback(err);
                });
            },
            followers: function (callback) {
                user.followers.addToSet(req.user._id);
                user.save(function (err) {
                    callback(err);
                });
            }},
        function (err) {
            if (err) { return next(err); }
            res.json(_.pick(user, '_id', 'name'));
        });
    });
})
.delete(function (req, res, next) {
    User.findById(req.body._id, function (err, user) {
        if (err) { return next(err); }

        async.parallel({
            following: function (callback) {
                req.user.following.pull(req.body._id);
                req.user.save(function (err) {
                    callback(err);
                });
            },
            followers: function (callback) {
                if (user) {
                    user.followers.pull(req.user._id);
                    user.save(function (err) {
                        callback(err);
                    });
                }
                else {
                    callback();
                }
            }},
        function (err) {
            if (err) { return next(err); }
            res.json(_.pick(user, '_id', 'name'));
        });
    });
});

router.get('/followers', function (req, res, next) {
    User.findById(req.user._id)
    .populate('followers', 'username name')
    .exec(function (err, user) {
        if (user) {
            res.json({'followers': user.followers});
        }
    });
});

module.exports = router;
