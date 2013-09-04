var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var ensureAuthenticated = require('../lib/middleware').ensureAuthenticated,
    User = require('../models').User,
    Tag = require('../models').Tag,
    Link = require('../models/links').Link,
    Suggestion = require('../models/links').Suggestion,
    localsettings = require('../settings'),
    Redis = require("redis"),
    redis = Redis.createClient(),
    async = require('async');

//libs
function set_tags(tagstring) {
    if (tagstring) {
        return _.map(tagstring.split(","), function(tag) {
            return tag.trim();
        });
    } else {
        return [];
    }

}

function set_private(_private) {
    if(typeof _private !== 'undefined'){
        return true;
    } else {
        return false;
    }
}

// links routes
module.exports.index = function(req, res, next){
    if (!req.isAuthenticated()) {
        async.parallel({
            tag_count: function(callback) {
                redis.zcard('tags', function (err, tag_count) {
                    callback(err, tag_count);
                });
            },
            url_count: function(callback) {
                redis.zcard('urls', function (err, url_count) {
                    callback(err, url_count);
                });
            },
            tags: function(callback) {
                redis.zrevrange('tags', 0, 9, function (err, tags) {
                    callback(err, tags);
                });
            },
            urls: function(callback) {
                redis.zrevrange('urls', 0, 9, function (err, urls) {
                    callback(err, urls);
                });
            }
        }, function (err, results) {
            return res.render('index', {
                url: localsettings.uri,
                urls: results.urls,
                tags: results.tags,
                url_count: results.url_count,
                tag_count: results.tag_count
            });
        });
    } else {
        var page = parseInt(req.query.page, 10) || 0;
        var per_page = 50;
        Link.find({creator: req.user._id}, {}, {skip: per_page * page, limit: per_page})
        .populate('creator')
        .sort('-created')
        .exec(function (err, links) {
            if (err) {
                next(err);
            }
            _.each(links, function(link) {
                link.joined_tags = link.tags.join(", ");
            });
            res.format({
                json: function () {
                    res.json(200, {
                        links: links
                    });
                },
                html: function () {
                    var previous = 0;
                    var next =  page;
                    if (page > 0) {
                        previous = page - 1;
                    }
                    if (links.length === per_page) {
                        next = page + 1;
                    }
                    res.render('links/index', {
                        links: links,
                        next: next,
                        previous: previous
                    });
                }
            });
        });
    }
};

module.exports.new_link = function (req, res) {
    req.assert('url', res.__('Needs to be a valid url')).isUrl();
    req.sanitize('url').xss();

    var errors = req.validationErrors();
    if (errors) {
        return res.render('links/new', {
            errors: errors,
            url: req.query.url
        });
    }

    request(req.query.url, function(error, response, body){
        if (!error && response.statusCode === 200) {
            var $ = cheerio.load(body);
            var link = new Link();
            link.url = req.query.url;
            link.title = $('html head title').text().trim() || null;

            return res.render('links/new', {
                link: link
            });
        }
        return res.render('links/new', {
            errors: [{
                msg: "url not found"
            }]
        });
    });
};

module.exports.create_link = function (req, res) {
    var link = new Link();
    link.url = req.body.url;
    link.title = req.body.title;
    link.content = req.body.content;
    link.description = req.body.description;
    link.tags = set_tags(req.body.tags);
    link.private = req.body.private;
    link.creator = req.user;
    return link.save(function (err) {
        if (err) {
            return res.json(200, {
                error: err.message
            });
        }
        redis.zincrby('urls', 1, link.url);
        _.each(link.tags, function (tag) {
            redis.zincrby('tags', 1, tag);
            redis.zincrby('tags_' + req.user._id, 1, tag);
        });
        return res.redirect('/');
    });
};

module.exports.edit_link = function (req, res) {
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
};

module.exports.update_link = function (req, res) {
    var id = req.body.id;
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
        link.title = req.body.title;
        link.description = req.body.description;
        link.tags = set_tags(req.body.tags);
        link.private = set_private(req.body.private);
        link.save(function (err) {
            if (err) {
                return;
            }
            _.each(old_tags, function (tag) {
                redis.zincrby('tags', -1, tag);
                redis.zincrby('tags_' + req.user._id, -1, tag);
            });
            _.each(link.tags, function (tag) {
                redis.zincrby('tags', 1, tag);
                redis.zincrby('tags_' + req.user._id, 1, tag);
            });
        });
        return res.redirect('/');
    });
};

module.exports.delete_link = function (req, res) {
    Link.findOne({url: req.body.url, creator: req.user})
    .exec(function (err, link) {
        if (err) {
            return res.json(200, {
                error: err.message
            });
        }
        var old_tags = link.tags;
        var url = link.url;
        link.remove(function (err) {
            if (err) {
                return;
            }
            redis.zincrby('urls', -1, url);
            _.each(old_tags, function (tag) {
                redis.zincrby('tags', -1, tag);
                redis.zincrby('tags_' + req.user._id, -1, tag);
            });
        });
        return res.json(200, {status: true});
    });
};

module.exports.all_tags = function (req, res) {
    redis.zrevrange('tags_' + req.user._id, 0, 100, function (err, tags) {
        res.render('links/all_tags', {
            tags: tags
        });
    });
};

module.exports.tags =  function (req, res) {
    var query = [{creator: req.user._id}];
    var params = "" + req.params;
    _.each(params.split("/"), function (tag) {
        query.push({'tags':tag});
    });
    var page = parseInt(req.query.page, 10) || 0;
    var per_page = 50;
    Link.find({$and: query}, {}, {skip: per_page * page, limit: per_page})
    .populate('creator')
    .sort('-created')
    .exec(function (err, links) {
        if (err) {
            return res.json(200, {
                error: 'No links'
            });
        }
        _.each(links, function(link) {
            link.joined_tags = link.tags.join(", ");
        });
        res.format({
            json: function () {
                res.json(200, {
                    links: links
                });
            },
            html: function () {
                var previous = 0;
                var next =  page;
                if (page > 0) {
                    previous = page - 1;
                }
                if (links.length === per_page) {
                    next = page + 1;
                }
                res.render('links/index', {
                    links: links,
                    next: next,
                    previous: previous
                });
            }
        });
    });
};

module.exports.bot_suggest = function (req, res) {
    if (req.body.seq !== localsettings.bot.seq) {
        return res.json(403, {status: false});
    }
    var url = req.body.url;
    if (url.indexOf("://") === -1) {
        url = "http://" + url;
    }
    User.findOne({username: req.body.from}).exec(function (err, from) {
        if (err || !from) {
            return res.json(403, {status: 'user (from) not found'});
        }
        User.findOne({username: req.body.to}).exec(function (err2, to) {
            if (err2 || !to) {
                return res.json(403, {status: 'user (to) not found'});
            }
            if (_.indexOf(to.followers, from._id)) {
                Suggestion.findOne({
                    from: from._id,
                    to: to._id,
                    url: url
                })
                .exec(function (err, suggestion) {
                    if (!suggestion) {
                        suggestion = new Suggestion();
                    }
                    suggestion.url = url;
                    suggestion.to = to._id;
                    suggestion.from = from._id;
                    suggestion.save();
                    return res.json(200, {status: true});
                });
            } else {
                return res.json(200, {status: false});
            }
        });
    });
};

module.exports.share = function (req, res) {
    var url = req.body.url;
    if (url.indexOf("://") === -1) {
        url = "http://" + url;
    }
    Suggestion.findOne({
        from: req.user._id,
        to: req.body.id,
        url: url
    })
    .exec(function (err, suggestion) {
        if (!suggestion) {
            suggestion = new Suggestion();
        }
        suggestion.url = url;
        suggestion.to = req.body.id;
        suggestion.from = req.user._id;
        suggestion.save(function (err) {
            if (err) {
                return;
            }
            redis.zincrby('urls', 1, url);
        });
        //return res.json(200, {status: true});
        return res.redirect('/');
    });
};

module.exports.suggestions = function (req, res) {
    Suggestion.find({
        to: req.user.username
    })
    .exec(function (err, suggestions) {
        res.render('links/suggestions', {
            suggestions: suggestions
        });
    });
};

module.exports.reject_suggestion = function (req, res) {
    Suggestion.findOne({url: req.body.url, to: req.user.username})
    .exec(function (err, link) {
        if (err) {
            return res.json(200, {
                error: err.message
            });
        }
        var url = link.url;
        link.remove(function (err) {
            redis.zincrby('urls', -1, url);
        });
        return res.json(200, {status: true});
    });
};
module.exports.accept_suggestion = function (req, res) {
    var link = new Link();
    link.url = req.body.url;
    link.title = req.body.title;
    link.content = req.body.content;
    link.description = req.body.description;
    link.tags = set_tags(req.body.tags);
    link.private = set_private(req.body.private);
    link.creator = req.user;
    return link.save(function (err) {
        if (err) {
            return res.json(200, {
                error: err.message
            });
        }
        _.each(link.tags, function (tag) {
            redis.zincrby('tags', -1, tag);
        });
        Suggestion.findOne({url: req.body.url, to: req.user.username})
        .exec(function (err, link) {
            if (err) {
                return res.json(200, {
                    error: err.message
                });
            }
            link.remove();
            return res.json(200, {status: true});
        });
    });
};
