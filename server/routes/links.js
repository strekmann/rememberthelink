var request = require('request');
var cheerio = require('cheerio');
var ensureAuthenticated = require('../lib/middleware').ensureAuthenticated,
    User = require('../models').User,
    Link = require('../models/links').Link;

// links routes
module.exports = function(app, prefix) {
    prefix = prefix + '/' || '/';

    // recent links
    app.get(prefix + '', function(req, res){
        Link.find()
        .populate('creator')
        .sort('-created')
        .exec(function (err, links) {
            if (err) {
                return res.json('200', {
                    error: 'No links'
                });
            }
            res.render('links/index', {
                links: links,
                user: req.user,
                url: "http://"+req.headers.host + req.url
            });
        });
    });

    app.get(prefix + 'new', ensureAuthenticated, function (req, res) {
        if (req.query.url) {
            // prepend http:// if no protocol
            var url = req.query.url;
            if (url.indexOf("://") === -1) {
                url = "http://" + url;
            }

            // fetch url and populate object
            request(url, function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                if (!error && response.statusCode === 200) {
                    var ch = cheerio.load(body);
                    var link = new Link();
                    link.url = url;
                    link.content = body;
                    link.title = ch('html head title').text() || null;
                    res.render('links/new', {link: link});
                }
            });
        } else {
            res.render('links/new');
        }
    });

    app.post(prefix + 'new', ensureAuthenticated, function (req, res) {
        var link = new Link();
        link.url = req.body.url;
        link.title = req.body.title;
        link.content = req.body.content;
        link.description = req.body.description;
        link.private = req.body.private;
        link.creator = req.user;
        return link.save(function (err) {
            if (err) {
                return res.json('200', {
                    error: err.message
                });
            }
            return res.redirect(prefix);
        });
    });

    app.put(prefix + 'edit', ensureAuthenticated, function (req, res) {
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
            if(typeof req.body.private !== 'undefined'){
                link.private = true;
            } else {
                link.private = false;
            }
            link.save();
            return res.json('200', {status: true});
        });
    });

    app.delete(prefix + 'delete', ensureAuthenticated, function (req, res) {
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
    });
};
