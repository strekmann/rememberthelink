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
        }
    }, function(err, results){
        res.render('friends/index', {
            active_user: results.user,
            user_count: results.count
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
            res.json({'status': true});
        }
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
