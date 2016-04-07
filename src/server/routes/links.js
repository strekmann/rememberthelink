var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    redis = require('../lib/redisclient'),
    User = require('../models/index').User,
    Link = require('../models/links').Link,
    Tag = require('../models').Tag,
    Suggestion = require('../models/links').Suggestion,
    settings = require('../settings'),
    redis_prefix = require('../../../package').name,
    version = require('../../../package').version,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

//libs
function set_tags(tagstring) {
    if (tagstring) {
        if (_.isArray(tagstring)){
            return tagstring;
        }
        else {
            return _.map(tagstring.split(","), function(tag) {
                return tag.trim();
            });
        }
    } else {
        return [];
    }

}

function clean_link(link) {
    var new_link = {};
    new_link.url = link.url;
    new_link.created = link.created.getTime();
    if (link.private) {
        new_link.private = true;
    } else {
        new_link.private = false;
    }
    if (link.title) {
        new_link.title = link.title;
    }
    if (link.description) {
        new_link.description = link.description;
    }
    if (link.tags.length) {
        new_link.tags = link.tags;
    }
    return new_link;
}

router.route('/')
    .get(function (req, res, next) { // all
        if (!req.isAuthenticated()) {
            async.parallel({
                tag_count: function(callback) {
                    redis.zcard(redis_prefix + '_tags', function (err, tag_count) {
                        callback(err, tag_count);
                    });
                },
                url_count: function(callback) {
                    redis.zcard(redis_prefix + '_urls', function (err, url_count) {
                        callback(err, url_count);
                    });
                },
                tags: function(callback) {
                    redis.zrevrange(redis_prefix + '_tags', 0, 9, function (err, tags) {
                        callback(err, tags);
                    });
                },
                urls: function(callback) {
                    redis.zrevrange(redis_prefix + '_urls', 0, 9, function (err, urls) {
                        callback(err, urls);
                    });
                }
            }, function (err, results) {
                return res.render('index', {
                    url: settings.uri,
                    urls: results.urls || [],
                    tags: results.tags || [],
                    url_count: results.url_count,
                    tag_count: results.tag_count,
                    show_buttons: true
                });
            });
        } else {
            var page = parseInt(req.query.page, 10) || 0;
            var per_page = 50;
            async.parallel({
                tags: function(callback){
                    var id = redis_prefix + '_tags_' + req.user._id;
                    redis.zrevrangebyscore(id, "+inf", 1, "withscores", "limit", 0, 20, function (err, tags_list) {
                        var tags = [];
                        for (var i = 0; i < tags_list.length; i += 2) {
                            tags.push({'text': tags_list[i], 'score': tags_list[i+1]});
                        }

                        callback(err, tags);
                    });
                },
                links: function(callback){
                    Link.find({creator: req.user._id}, {}, {skip: per_page * page, limit: per_page})
                    .populate('creator')
                    .sort('-created')
                    .exec(function (err, links) {
                        if (err) {
                            return callback(err);
                        }
                        _.each(links, function(link) {
                            link.joined_tags = link.tags.join(", ");
                        });

                        callback(null, links);
                    });
                }
            }, function(err, data){
                if (err){ return next(err); }

                res.format({
                    json: function () {
                        res.json(200, {
                            links: data.links,
                            tags: data.tags
                        });
                    },
                    html: function () {
                        var previous = 0;
                        var next = page;
                        if (page > 0) {
                            previous = page - 1;
                        }
                        if (data.links.length === per_page) {
                            next = page + 1;
                        }
                        res.render('links/index', {
                            links: data.links,
                            tags: data.tags,
                            show_buttons: data.links.length === 0,
                            next: next,
                            previous: previous
                        });
                    }
                });
            });
        }
    })
    .post(ensureAuthenticated, function (req, res, next) {
        var link = new Link();
        link.url = req.body.url;
        link.title = req.body.title;
        link.description = req.body.description;
        link.tags = set_tags(req.body.tags);
        if (req.body.private === "true") {
            link.private = true;
        } else {
            link.private = false;
        }
        link.creator = req.user;
        link.save(function (err, link) {
            if (err) {
                console.error(err);
                return res.json(200, {
                    error: err.message
                });
            }
            if (!link.private) {
                redis.zincrby('urls', 1, link.url);
                _.each(link.tags, function (tag) {
                    redis.zincrby(redis_prefix + '_tags', 1, tag);
                    redis.zincrby(redis_prefix + '_tags_' + req.user._id, 1, tag);
                });
            }
            res.status(200).json(link);
        });
    })
    .put(ensureAuthenticated, function (req, res, next) {
        var id = req.body._id;
        if (!id){ return next(new Error("No id given!")); }

        Link.findOne({_id: id, creator: req.user._id})
        .exec(function (err, link) {
            if (err) {
                return next(err);
            }
            if (!link) {
                return res.render(404, {
                    error: "Link not found"
                });
            }
            var old_tags = link.tags;
            var old_private = link.private;
            link.title = req.body.title;
            link.description = req.body.description;
            link.tags = set_tags(req.body.tags);
            if (req.body.private === "true") {
                link.private = true;
            } else {
                link.private = false;
            }
            link.save(function (err) {
                if (err) {
                    return next(err);
                }
                if (!old_private) {
                    _.each(old_tags, function (tag) {
                        redis.zincrby(redis_prefix + '_tags', -1, tag);
                        redis.zincrby(redis_prefix + '_tags_' + req.user._id, -1, tag);
                    });
                }
                if (!link.private) {
                    _.each(link.tags, function (tag) {
                        redis.zincrby(redis_prefix + '_tags', 1, tag);
                        redis.zincrby(redis_prefix + '_tags_' + req.user._id, 1, tag);
                    });
                }
                return res.json(link);
            });
        });
    })
    .delete(ensureAuthenticated, function (req, res, next) {
        Link.findOneAndRemove({_id: req.body._id, creator: req.user})
        .exec(function (err, link) {
            if (err) { return next(err); }

            if (!link.private) {
                redis.zincrby(redis_prefix + '_urls', -1, link.url);
                _.each(link.tags, function (tag) {
                    redis.zincrby(redis_prefix + '_tags', -1, tag);
                    redis.zincrby(redis_prefix + '_tags_' + req.user._id, -1, tag);
                });
            }
            return res.json({status: true});
        });
    });

var fetch_title = function (url, callback) {
    if (url.indexOf('http') !== 0) {
        url = 'http://' + url;
    }

    request({
        url: url,
        gzip: true,
        headers: {
            'User-Agent': 'Rememberthelink/' + version
        }
    }, function(err, response, body){
        if (err) {
            return callback(err);
        }
        if (!body) {
            return callback(new Error(res.locals.__("Could not fetch page")));
        }
        var $ = cheerio.load(body);
        var title = $('html head title').text().trim();

        // For weird pages ...
        if (!title){
            title = $('title').first().text().trim() || "";
        }
        callback(null, url, title);
    });
};

router.get('/title', function (req, res, next) {
    var url = req.query.url;

    if (!url) { return next(new Error(res.locals.__('Url missing.'))); }

    fetch_title(url, function (err, url, title) {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.status(200).json({title: title, url: url});
    });
});

// will probably be replaced by ractive fun
router.get('/new', ensureAuthenticated, function (req, res, next) {
    req.assert('url', res.locals.__('Needs to be a valid url')).isURL();

    var url = req.query.url;
    if (url.indexOf('http') !== 0) {
        url = 'http://' + url;
    }

    var errors = req.validationErrors();
    if (errors) {
        return res.render('links/new', {
            errors: errors,
            url: req.query.url
        });
    }

    Link.findOne({url: url, creator: req.user._id}).exec(function (err, link) {
        if (link) {
            res.render('links/new', {link: link});
        }
        else {
            fetch_title(url, function (err, url, title) {
                if (err) {
                    req.flash('error', 'Not found');
                }
                res.render('links/new', {link: {url: url, title: title, new: true}});
            });
        }
    });
});

// will probably be replaced by ractive fun
router.get('/edit/:id', ensureAuthenticated, function (req, res, next) {
    var _id = req.params.id;
    Link.findOne({_id: _id, creator: req.user._id}).exec(function (err, link) {
        if (!link) {
            return res.render(404, {error: 'Link not found'});
        }

        link.joined_tags = link.tags.join(", ");

        return res.render('links/edit', {
            link: link
        });
    });
});

// think again!
router.get('/tags', ensureAuthenticated, function (req, res, next) {
    redis.zrevrangebyscore(redis_prefix + '_tags_' + req.user._id, "+inf", 1, "withscores", function (err, tags) {

        var all =[];
        for (var i = 0; i < tags.length; i += 2) {
            all.push({'text': tags[i], 'score': tags[i+1]});
        }

        res.format({
            // json = search
            json: function () {
                var prefix = req.query.q;
                if (prefix) {
                    tags = _.filter(all, function(tag) {
                        if (tag.text.toUpperCase().indexOf(prefix.toUpperCase())===0) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
                res.json({
                    tags: tags
                });
            },
            html: function () {
                var max = 1;
                if (all.length > 0) {
                    max = all[0].score;

                    all.sort(function(a, b){
                        return a.text < b.text ? -1 : 1;
                    });
                }

                all = _.map(all, function(tag){
                        tag.size = (Math.log(+tag.score) - Math.log(1))/(Math.log(+max+1) - Math.log(1)) + 1;
                        tag.size *= tag.size;
                        tag.size += "rem";
                        return tag;
                    });

                res.render('links/all_tags', {
                    tags: all,
                    max: max
                });
            }
        });
    });
});
router.get('/tags/*', ensureAuthenticated, function (req, res, next) {
    var query = [{creator: req.user._id}];
    var params = req.params[0];
    _.each(params.split("/"), function (tag) {
        query.push({'tags':tag});
    });
    var page = parseInt(req.query.page, 10) || 0;
    var per_page = 50;

    async.parallel({
        tags: function(callback){
            var id = redis_prefix + '_tags_' + req.user._id;
            redis.zrevrangebyscore(id, "+inf", 1, "withscores", "limit", 0, 20, function (err, tags_list) {
                var tags = [];
                for (var i = 0; i < tags_list.length; i += 2) {
                    tags.push({'text': tags_list[i], 'score': tags_list[i+1]});
                }

                callback(err, tags);
            });
        },
        links: function(callback){
            Link.find({$and: query}, {}, {skip: per_page * page, limit: per_page})
            .populate('creator')
            .sort('-created')
            .exec(function (err, links) {
                if (err) {
                    return callback(err);
                }
                _.each(links, function(link) {
                    link.joined_tags = link.tags.join(", ");
                });

                callback(null, links);
            });
        }
    }, function(err, data){
        res.format({
            json: function () {
                res.json(200, {
                    links: data.links,
                    tags: data.tags
                });
            },
            html: function () {
                var previous = 0;
                var next = page;
                if (page > 0) {
                    previous = page - 1;
                }
                if (data.links.length === per_page) {
                    next = page + 1;
                }
                res.render('links/index', {
                    links: data.links,
                    tags: data.tags,
                    next: next,
                    previous: previous
                });
            }
        });
    });
});

router.route('/suggestions')
    .all(ensureAuthenticated)
    .get(function (req, res, next) {
        Suggestion.find({
            to: req.user._id
        })
        .exec(function (err, suggestions) {
            res.render('links/suggestions', {
                suggestions: suggestions
            });
        });
    })
    .post(function (req, res, next) {
        req.assert('url', res.locals.__('Needs to be a valid url')).isURL();
        req.assert('to', res.locals.__('Needs to be specified')).notEmpty();

        var errors = req.validationErrors();
        var recipients;

        if (errors) {
            return res.json(200, {
                errors: errors,
            });
        }

        if (_.isString(req.body.to)) {
            recipients = req.body.to.split(",");
        }
        else {
            recipients = req.body.to;
        }

        async.eachLimit(recipients, 5, function (recipient, callback) {

            if (!_.contains(req.user.followers, recipient)) {
                callback();
            }
            else {
                Suggestion.findOne({
                    from: req.user._id,
                    to: recipient,
                    url: req.body.url
                })
                .exec(function (err, suggestion) {
                    if (!suggestion) {
                        suggestion = new Suggestion();
                    }
                    suggestion.url = req.body.url;
                    suggestion.to = recipient;
                    suggestion.from = req.user._id;
                    suggestion.title = req.body.title;
                    suggestion.description = req.body.description;
                    suggestion.save(function (err) {
                        callback(err);
                    });
                });
            }
        }, function (err) {
            if (err) {
                return res.status(500).json({
                    error: res.locals.__('Could not save: ' + err.message)
                });
            }
            return res.json({
                status: true
            });
        });
    })
    .delete(function (req, res, next) {
        Suggestion.findOne({_id: req.body._id, to: req.user._id})
        .exec(function (err, suggestion) {
            if (err) { return next(err); }
            suggestion.remove(function (err) {
                return res.json({status: true});
            });
        });
    })
    .put(function (req, res, next) {
        Suggestion.findOne({_id: req.body._id, to: req.user._id})
        .exec(function (err, suggestion) {
            if (err) { return next(err); }
            suggestion.remove(function (err) {
                redis.zincrby(redis_prefix + '_urls', 1, suggestion.url);

                var link = new Link();
                link.url = suggestion.url;
                link.title = suggestion.title;
                link.creator = req.user;
                link.save(function (err) {
                    if (err) { return next(err); }
                    return res.json({status: true});
                });
            });
        });
    });

module.exports = router;
