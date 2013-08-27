var _ = require('underscore');
var User = require('../models').User;

// links routes
module.exports.index = function(req, res){
    User.findById(req.user._id)
    .populate('followers following')
    .exec(function (err, user) {
        res.render('friends/index', {
            user: user
        });
    });
};

module.exports.search = function (req, res) {
    User.find({'username': req.query.username})
    .exec(function (error, users) {
        res.render('friends/search', {
            users: users,
            user: req.user
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
            res.json('200', {'status': true});
        }
    });
};
