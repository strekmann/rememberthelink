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
    localsettings = require('../settings'),
    version = require('../../package').version,
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

function set_private(_private) {
    if(typeof _private !== 'undefined'){
        return true;
    } else {
        return false;
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
                        var next = page;
                        if (page > 0) {
                            previous = page - 1;
                        }
                        if (links.length === per_page) {
                            next = page + 1;
                        }
                        res.render('links/index', {
                            links: links,
                            show_buttons: links.length === 0,
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
        if (req.body.private) {
            link.private = true;
        } else {
            link.private = false;
        }
        link.creator = req.user;
        link.save(function (err, link) {
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
            link.title = req.body.title;
            link.description = req.body.description;
            link.tags = set_tags(req.body.tags);
            if (req.body.private) {
                link.private = true;
            } else {
                link.private = false;
            }
            link.save(function (err) {
                if (err) {
                    return next(err);
                }
                _.each(old_tags, function (tag) {
                    redis.zincrby('tags', -1, tag);
                    redis.zincrby('tags_' + req.user._id, -1, tag);
                });
                _.each(link.tags, function (tag) {
                    redis.zincrby('tags', 1, tag);
                    redis.zincrby('tags_' + req.user._id, 1, tag);
                });
                return res.json(link);
            });
        });
    })
    .delete(ensureAuthenticated, function (req, res, next) {
        Link.findOneAndRemove({_id: req.body._id, creator: req.user})
        .exec(function (err, link) {
            if (err) { return next(err); }

            var old_tags = link.tags;
            var url = link.url;
            redis.zincrby('urls', -1, url);
            _.each(old_tags, function (tag) {
                redis.zincrby('tags', -1, tag);
                redis.zincrby('tags_' + req.user._id, -1, tag);
            });
            return res.json({status: true});
        });
    });

router.get('/title', function (req, res, next) {
    var url = req.query.url;

    if (!url) { return next(new Error(res.locals.__('Url missing.'))); }

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
            return res.status(400).json({error: err.message});
        }

        if (!body) {
            return res.status(400).json({error: res.locals.__('Could not fetch page')});
        }

        var $ = cheerio.load(body);
        var title = $('html head title').text().trim();

        // For weird pages ...
        if (!title){
            title = $('title').first().text().trim() || "";
        }

        res.status(200).json({title: title});
    });
});

// will probably be replaced by ractive fun
router.get('/new', ensureAuthenticated, function (req, res, next) {
    req.assert('url', res.locals.__('Needs to be a valid url')).isURL();

    var errors = req.validationErrors();
    if (errors) {
        return res.render('links/new', {
            errors: errors,
            url: req.query.url
        });
    }

    Link.findOne({url: req.query.url, creator: req.user._id}).exec(function (err, link) {
        if (link) {
            res.redirect('/edit/' + link.id);
        }
    });

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
    redis.zrevrangebyscore('tags_' + req.user._id, "inf", 1, "withscores", function (err, tags) {

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
                res.json(200, {
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
                var next = page;
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
                        if (err) {
                            callback(err);
                        }
                        else {
                            redis.zincrby('urls', 1, req.body.url);
                            callback();
                        }
                    });
                });
            }
        }, function (err) {
            if (err) {
                return res.status(500).json({
                    error: res.locals.__('Could not save: ' + err.message)
                });
            }
            return res.json(200, {
                status: true
            });
        });
    });

router.route('/suggestions/check')
    .all(ensureAuthenticated)
    .delete(function (req, res, next) {
        Suggestion.findOne({url: req.body.url, to: req.user._id})
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
    })
    .post(function (req, res, next) {
        req.assert('url', res.locals.__('Needs to be a valid url')).isUrl();

        var errors = req.validationErrors();
        if (errors) {
            return res.json(200, {
                errors: errors,
            });
        }

        var link = new Link();
        link.url = req.body.url;
        link.title = req.body.title;
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
            Suggestion.findOne({url: req.body.url, to: req.user._id})
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
    });

router.route('/import')
    .all(ensureAuthenticated)
    .get(function (req, res, next) {
        return res.render('links/import');
    })
    .post(function (req, res, next) {
        fs.readFile(req.files.import.path, 'utf-8', function (err, data) {
            var bookmarks = data.split(/<DT>/);
            var affected = 0;
            var wanted = 0;
            async.each(bookmarks, function (bookmark, callback) {
                var $ = cheerio.load(bookmark);
                var link = $('a').first();
                if (link.length) {
                    wanted += 1;
                    var url = link.attr("href"),
                        date = link.attr("add_date"),
                        tags = _.map(link.attr("tags").split(","), function (tag) {
                            return tag.trim();
                        }),
                        priv = parseInt(link.attr("private"), 10),
                        title = link.text(),
                        description = $('dd').text();

                    Link.findOne({url: url, creator: req.user._id}, function (err, dblink) {
                        if (!dblink) {
                            dblink = new Link();
                            dblink.url = url;
                            dblink.creator = req.user._id;
                            if (tags && tags.length) {
                                dblink.tags = tags;
                                async.each(
                                    dblink.tags,
                                    function (tag, callback) {
                                        tag = tag.trim();
                                        if (tag.length > 0) {
                                            redis.zincrby('tags', 1, tag);
                                            redis.zincrby('tags_' + req.user._id, 1, tag);
                                        }
                                        callback(null);
                                    },
                                    function (err) {
                                    }
                                );
                            }

                        }
                        if (priv) {
                            dblink.private = true;
                        } else {
                            dblink.private = false;
                        }
                        dblink.created = new Date(date);
                        dblink.title = title;
                        dblink.description = description;

                        dblink.save(function (err) {
                            affected += 1;
                            callback(err);
                        });
                    });
                } else {
                    callback();
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                return res.json(200, {status: true, saved: affected, bookmarks: wanted});
            });
        });
    });

router.get('/export', ensureAuthenticated, function (req, res, next) {
    return res.render('links/export');
});
router.get('/export/bookmarks', ensureAuthenticated, function (req, res, next) {
    var sep = '\n';
    var bookmarks = [
        '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
        '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
        '<!-- This is an automatically generated file.',
        'It will be read and overwritten.',
        'Do Not Edit! -->',
        '<TITLE>Bookmarks</TITLE>',
        '<H1>Bookmarks</H1>',
        '<DL><p>'
    ].join(sep) + sep;

    res.format({
        html: function () {
            Link.find({creator: req.user._id}).exec(function (err, links) {
                _.each(links, function (link, i) {
                    var priv;
                    if (link.private) {
                        priv = "1";
                    } else {
                        priv = "0";
                    }
                    bookmarks += '<DT><A HREF="' + link.url + '" ADD_DATE="' + link.created.getTime() + '" PRIVATE="' + priv + '" TAGS="' + link.tags + '">' + link.title + '</A>' + sep;
                    if (link.description) {
                        bookmarks += '<DD>' + link.description;
                    }
                });
                bookmarks += '</DL><p>';
                res.set('Content-Type', 'text/html');
                res.set('Content-Disposition', 'attachment; filename="bookmarks.html"');
                res.send(new Buffer(bookmarks));
            });
        },
        json: function () {
            Link.find({creator: req.user._id}).exec(function (err, links) {
                cleaned_links = _.map(links, clean_link);
                res.json(200, {bookmarks: cleaned_links});
            });
        }
    });
});

module.exports = router;
