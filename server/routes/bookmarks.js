var express = require('express'),
    router = express.Router(),
    async = require('async'),
    moment = require('moment'),
    fs = require('fs'),
    _ = require('underscore'),
    cheerio = require('cheerio'),
    settings = require('../settings'),
    redis_prefix = settings.redis.prefix || 'rtl',
    redis = require('../lib/redisclient'),
    Link = require('../models/links').Link,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

router.route('/')
    .get(function (req, res, next) {
        var n = '\n';
        var bookmarks = [
            '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
            '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
            '<!-- This is an automatically generated file.',
            'It will be read and overwritten.',
            'Do Not Edit! -->',
            '<TITLE>Bookmarks</TITLE>',
            '<H1>Bookmarks</H1>',
            '<DL><p>'
        ].join(n) + n;

        Link.find({creator: req.user._id}, function (err, links) {
            bookmarks += _.map(links, function (link) {
                var priv = link.private ? 1 : 0;

                var bookmark = '<DT><A HREF="' + link.url + '" ADD_DATE="' + link.created.getTime() + '" PRIVATE="' + priv + '" TAGS="' + link.tags + '">' + link.title + '</A>';
                if (link.description) {
                    bookmark += n + '<DD>' + link.description;
                }
                return bookmark;
            }).join(n);
            bookmarks += '</DL><p>';
            res.set('Content-Type', 'text/html');
            res.set('Content-Disposition', 'attachment; filename="bookmarks.html"');
            res.send(new Buffer(bookmarks));
        });
    })
    .post(function (req, res, next) {
        fs.readFile(req.files.import.path, 'utf-8', function (err, data) {
            var bookmarks = data.split(/<dt>/i);

            var added = 0;
            async.eachLimit(bookmarks, 10, function (bookmark, callback) {
                var $ = cheerio.load(bookmark);
                var link = $('a').first();

                if (link.length) {

                    var l = {
                        url: link.attr('href'),
                        title: link.text().trim(),
                        description: $('dd').text().trim(),
                        creator: req.user._id
                    };
                    if (link.attr('add_date')) {
                        l.date = moment(link.attr('add_date'), 'X').toDate();
                    }
                    if (link.attr('tags')) {
                        l.tags = _.map(link.attr('tags').split(','), function (tag) {
                            return tag.trim();
                        });
                    }
                    if (link.attr('private')) {
                        l.private = 1 === parseInt(link.attr('private'), 10);
                    }

                    Link.update({creator: req.user._id, url: l.url}, l, {upsert: true}, function (err, affected) {
                        if (err) { return callback(err); }
                        added += affected;

                        if (!l.private) {
                            _.each(l.tags, function (tag) {
                                redis.zincrby(redis_prefix + '_tags', 1, tag);
                                redis.zincrby(redis_prefix + '_tags_' + req.user._id, 1, tag);
                            });
                        }
                        return callback();
                    });

                }
                else {
                    return callback();
                }
            }, function (err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        });
});

module.exports = router;
