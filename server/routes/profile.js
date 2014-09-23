var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    redis = require('../lib/redisclient'),
    async = require('async'),
    settings = require('../settings'),
    redis_prefix = settings.redis.prefix || 'rtl',
    User = require('../models').User,
    Link = require('../models/links').Link,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

router.use(ensureAuthenticated);

router.get('/:id', function (req, res, next) {
    async.waterfall([
        function(callback){ // fetch user profile
            User.findById(req.params.id)
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
                    var nextPage = page;
                    if (page > 0) {
                        previous = page - 1;
                    }
                    if (links.length === per_page) {
                        nextPage = page + 1;
                    }
                    return callback(err, {
                        links: links,
                        profile: profile,
                        previous: previous,
                        next: nextPage
                    });
                });
            });
        },

        function(result, callback) { // fetch tags
            var id = redis_prefix + '_tags_' + result.profile._id;
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
});

module.exports = router;
