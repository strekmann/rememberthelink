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
        .exec(function (err, links) {
            if (err) {
                return res.json('200', {
                    error: 'No links'
                });
            }
            res.render('links/index', {
                links: links, user: req.user
            });
        });
    });

    app.get(prefix + 'new', ensureAuthenticated, function (req, res) {
        if (req.query.url) {
            // fetch url and populate object
            request(req.query.url, function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                if (!error && response.statusCode == 200) {
                    var ch = cheerio.load(body);
                    var link = new Link();
                    link.url = req.query.url;
                    link.content = body;
                    link.title = ch('html head title').text() || null;
                    console.log(link);
                    res.render('links/new', {link: link});
                }
            });
        } else {
            console.log(req);
            res.render('links/new');
        }
    });

    app.post(prefix + 'new', ensureAuthenticated, function (req, res) {
        link = new Link();
        link.url = req.body.url;
        link.title = req.body.title;
        link.content = req.body.content;
        link.description = req.body.description;
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
};
