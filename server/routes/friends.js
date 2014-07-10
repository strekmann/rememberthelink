var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    redis = require('../lib/redisclient'),
    async = require('async'),
    User = require('../models').User,
    Link = require('../models/links').Link,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

router.use(ensureAuthenticated);

router.get('/', function (req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.user._id)
            .populate('followers following')
            .exec(function(err, user){
                callback(err, user);
            });
        },
        count: function(callback){
            User.count().exec(function(err, count){
                callback(err, count);
            });
        },
        users: function(callback){
            if (req.query.username === undefined) {
                return callback(null, []);
            }

            User.find({'username': req.query.username})
            .exec(function (err, users) {
                callback(err, users);
            });
        }
    }, function(err, results){
        res.render('friends/index', {
            user: results.user,
            user_count: results.count,
            users: results.users
        });
    });
});
router.get('/search', function (req, res, next) {
    User.find({'username': req.query.username})
    .exec(function (error, users) {
        res.render('friends/search', {
            users: users
        });
    });
});
router.post('/add', function (req, res, next) {
    var username = req.body.username;
    User.findOne({'username': username})
    .exec(function (err, user) {
        if (user) {
            req.user.following.push(user._id);
            req.user.save();
            user.followers.push(req.user._id);
            user.save();
            res.json(200, {'status': true});
        }
    });
});
router.get('/followers', function (req, res, next) {
    User.findById(req.user._id)
    .populate('followers')
    .exec(function (err, user) {
        if (user) {
            res.json(200, {'followers': user.followers});
        }
    });
});
