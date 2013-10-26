var _ = require('underscore'),
    redis = require('../lib/redisclient'),
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
    if (true || profile && _.indexOf(profile.follows, req.user._id) > -1) {
        async.waterfall([
            function(callback){ // fetch user profile
                User.findOne({username: req.params.username})
                .exec(function (err, profile) {
                    if (err) {
                        return callback({
                            status: 500,
                            error: err
                        });
                    }

                    if ( profile === null) {
                        return callback({
                            status: 404,
                            error: res.__("User not found")
                        });
                    }

                    var page = parseInt(req.query.page, 10) || 0;
                    var per_page = 50;
                    Link.find({creator: profile._id, private: false}, {}, {skip: per_page * page, limit: per_page})
                    .sort('-created')
                    .exec(function (err, links) {
                        if (err) {
                            next(err);
                        }
                        _.each(links, function(link) {
                            link.joined_tags = link.tags.join(", ");
                        });
                        var previous = 0;
                        var next =  page;
                        if (page > 0) {
                            previous = page - 1;
                        }
                        if (links.length === per_page) {
                            next = page + 1;
                        }
                        return callback(err, {
                            links: links,
                            profile: profile,
                            previous: previous,
                            next: next
                        });
                    });
                });
            },

            function(result, callback) { // fetch tags
                var id = 'tags_' + result.profile._id;
                redis.zrevrangebyscore(id, 10, 1, "withscores", function (err, tags_list) {
                    var tags = [];
                    for (var i = 0; i < tags_list.length; i += 2) {
                        tags.push({'text': tags_list[i], 'score': tags_list[i+1]});
                    }
                    result.tags = tags;

                    callback(err, result);
                });
            }
        ], function(err, result){
            if (err) {
                return res.render(err.status, {
                    error: err.error
                });
            }
            return res.render('friends/profile', result);
        });
    } else {
        return res.json(403, {'error': res.__('You are not allowed to see this')});
    }
};
