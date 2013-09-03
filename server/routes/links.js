var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var ensureAuthenticated = require('../lib/middleware').ensureAuthenticated,
    User = require('../models').User,
    Tag = require('../models').Tag,
    Link = require('../models/links').Link,
    Suggestion = require('../models/links').Suggestion,
    localsettings = require('../settings');

// links routes
module.exports.index = function(req, res){
    if (!req.isAuthenticated()) {
        return res.render('index', {
            user: req.user,
            url: localsettings.uri
        });
    }

    Link.find()
    .populate('creator')
    .sort('-created')
    .exec(function (err, links) {
        if (err) {
            return res.json('200', {
                error: 'No links'
            });
        }
        _.each(links, function(link) {
            link.joined_tags = _.reduce(link.tags, function (memo, tag, index) {
                if (index > 0) {
                    return memo + ", " + tag._id;
                } else {
                    return tag._id;
                }
            }, "");
        });
        res.render('links/index', {
            links: links,
            user: req.user
        });
    });
};

module.exports.new_link = function (req, res) {
    if (req.query.url) {
        // prepend http:// if no protocol
        var url = req.query.url;
        if (url.indexOf("://") === -1) {
            url = "http://" + url;
        }

        // fetch url and populate object
        request(url, function (error, response, body) {
                if (error) {
    }
    if (!error && response.statusCode === 200) {
        var ch = cheerio.load(body);
        var link = new Link();
        link.url = url;
        link.content = body;
        link.title = ch('html head title').text().trim() || null;
        res.render('links/new', {link: link});
    }
});
        } else {
            res.render('links/new');
        }
    };

module.exports.create_link = function (req, res) {
    var link = new Link();
    link.url = req.body.url;
    link.title = req.body.title;
    link.content = req.body.content;
    link.description = req.body.description;
    var tags = req.body.tags;
    if (tags) {
        link.tags = _.map(tags.split(","), function(tag) {
            return new Tag({_id: tag.trim()});
        });
    }
    link.private = req.body.private;
    link.creator = req.user;
    return link.save(function (err) {
        if (err) {
            return res.json('200', {
                error: err.message
            });
        }
        return res.redirect('/');
    });
};

module.exports.update_link = function (req, res) {
    var url = req.body.url;
    Link.findOne({url: url, creator: req.user})
    .exec(function (err, link) {
        if (err) {
            return res.json('200', {
                error: err.message
            });
        }
        link.title = req.body.title;
        link.description = req.body.description;
        var tags = req.body.tags;
        if (tags) {
            link.tags = _.map(tags.split(","), function(tag) {
                return new Tag({_id: tag.trim()});
            });
        }
        if(typeof req.body.private !== 'undefined'){
            link.private = true;
        } else {
            link.private = false;
        }
        link.save();
        return res.json('200', {status: true});
    });
};

module.exports.delete_link = function (req, res) {
    Link.findOne({url: req.body.url, creator: req.user})
    .exec(function (err, link) {
        if (err) {
            return res.json('200', {
                error: err.message
            });
        }
        link.remove();
        return res.json('200', {status: true});
    });
};

module.exports.tags =  function (req, res) {
    var query = [];
    var params = "" + req.params;
    _.each(params.split("/"), function (tag) {
        query.push({'tags._id':tag});
    });
    Link.find({$and: query})
    .populate('creator')
    .sort('-created')
    .exec(function (err, links) {
        if (err) {
            return res.json('200', {
                error: 'No links'
            });
        }
        _.each(links, function(link) {
            link.joined_tags = _.reduce(link.tags, function (memo, tag, index) {
                if (index > 0) {
                    return memo + ", " + tag._id;
                } else {
                    return tag._id;
                }
            }, "");
        });
        res.render('links/index', {
            links: links,
            user: req.user,
            url: localsettings.uri
        });
    });
};

module.exports.bot_suggest = function (req, res) {
    if (req.body.seq !== localsettings.bot.seq) {
        return res.json('403', {status: false});
    }
    var url = req.body.url;
    if (url.indexOf("://") === -1) {
        url = "http://" + url;
    }
    User.findOne({username: req.body.from}).exec(function (err, from) {
        if (err || !from) {
            return res.json('403', {status: 'user (from) not found'});
        }
        User.findOne({username: req.body.to}).exec(function (err2, to) {
            if (err2 || !to) {
                return res.json('403', {status: 'user (to) not found'});
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
                    return res.json('200', {status: true});
                });
            } else {
                return res.json('200', {status: false});
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
        suggestion.save();
        //return res.json('200', {status: true});
        return res.redirect('/');
    });
};

module.exports.suggestions = function (req, res) {
    Suggestion.find({
        to: req.user.username
    })
    .exec(function (err, suggestions) {
        res.render('links/suggestions', {
            suggestions: suggestions,
            user: req.user
        });
    });
};

module.exports.reject_suggestion = function (req, res) {
    Suggestion.findOne({url: req.body.url, to: req.user.username})
    .exec(function (err, link) {
        if (err) {
            return res.json('200', {
                error: err.message
            });
        }
        link.remove();
        return res.json('200', {status: true});
    });
};
module.exports.accept_suggestion = function (req, res) {
    var link = new Link();
    link.url = req.body.url;
    link.title = req.body.title;
    link.content = req.body.content;
    link.description = req.body.description;
    var tags = req.body.tags;
    if (tags) {
        link.tags = _.map(tags.split(","), function(tag) {
            return new Tag({_id: tag.trim()});
        });
    }
    if(typeof req.body.private !== 'undefined'){
        link.private = true;
    } else {
        link.private = false;
    }
    link.creator = req.user;
    return link.save(function (err) {
        if (err) {
            return res.json('200', {
                error: err.message
            });
        }
        Suggestion.findOne({url: req.body.url, to: req.user.username})
        .exec(function (err, link) {
            if (err) {
                return res.json('200', {
                    error: err.message
                });
            }
            link.remove();
            return res.json('200', {status: true});
        });
    });
};
