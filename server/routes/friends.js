var _ = require('underscore'),
    async = require('async');

var User = require('../models').User,
    Link = require('../models/links').Link;

// links routes
module.exports.index = function(req, res){
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
};

module.exports.search = function (req, res) {
    User.find({'username': req.query.username})
    .exec(function (error, users) {
        res.render('friends/search', {
            users: users
        });
    });
};

module.exports.add = function (req, res) {
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
};

module.exports.followers = function (req, res) {
    User.findById(req.user._id)
    .populate('followers')
    .exec(function (err, user) {
        if (user) {
            res.json(200, {'followers': user.followers});
        }
    });
};

module.exports.profile = function (req, res) {
    User.findOne({username: req.params.username})
    .exec(function (err, profile) {
        if (profile && _.indexOf(profile.followers, req.user._id) > -1) {
            Link.find({creator: profile._id, private: false})
            .sort('-created')
            .exec(function (err, links) {
                return res.render('friends/profile', {
                    links: links,
                    profile: profile
                });
            });
        } else {
            return res.json(403, {'status': 'You are not allowed to see this'});
        }
    });
};
