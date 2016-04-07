var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    User = require('../models/index').User,
    Link = require('../models/links').Link,
    ensureAdmin = require('../lib/middleware').ensureAdmin;

router.use(ensureAdmin);

router.get('/', function (req, res, next) {
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
                var next = page;
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
                        console.error("error when countin link:");
                        next(err);
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
});

router.put('/permissions/:id', function (req, res, next) {
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
});

module.exports = router;
