var async = require('async'),
    User = require('../models').User,
    Link = require('../models/links').Link;

module.exports.user_list = function(req, res, next){
    var page = parseInt(req.query.page, 10) || 0;
    var per_page = 50;
    User.find({}, {}, {skip: per_page * page, limit: per_page})
    .sort('-created')
    .exec(function (err, users) {
        if (err) {
            next(err);
        }
        res.format({
            html: function () {
                var previous = 0;
                var next =  page;
                if (page > 0) {
                    previous = page - 1;
                }
                if (users.length === per_page) {
                    next = page + 1;
                }
                async.each(users, function(user, callback) {
                    Link.count({creator: user._id}).exec(function (err, link_count) {
                        user.link_count = link_count;
                        callback(err);
                    });
                }, function (err) {
                    if (err) {
                        console.log("error when countin link:", err);
                    }
                    res.render('admin/user_list', {
                        users: users,
                        next: next,
                        previous: previous
                    });
                });
            }
        });
    });
};

module.exports.set_permissions = function(req, res, next){
    var user_id = req.params.id;

    if (req.body.is_active === undefined && req.body.is_admin === undefined) {
        return res.json(200, {status: false});
    } else {
        User.findOne({_id: user_id})
        .exec(function (err, user) {
            if (req.user._id !== user_id) {
                if (req.body.is_active !== undefined) {
                    user.is_active = req.body.is_active;
                }
                if (req.body.is_admin !== undefined) {
                    user.is_admin = req.body.is_admin;
                }
                user.save();
                return res.json(200, {status: true});
            } else {
                return res.json(200, {status: false});
            }
        });
    }
};

module.exports.user_admin = function(req, res, next){
    var admin = req.body.admin,
        user_id = req.body.id;
    User.findOne({_id: user_id})
    .exec(function (err, user) {
        user.is_admin = admin;
        user.save();
        return res.json(200, {status: true});
    });
};
