var jsdom = require('jsdom');
var sys = require("sys");
var app = require('./app');
var mongoose = require('mongoose');
var _ = require("underscore");
app.db = mongoose.connect('mongodb://localhost/' + app.conf.db_name);

var fs = require("fs"),
_ = require("underscore"),
User = require('./models').User,
Tag = require('./models').Tag,
Link = require('./models/links').Link;

function createOrUpdateLink(url, title, date, priv, tags, userid) {
    console.log(url);
    Link.findOne({url: url, creator: userid}).exec(function (err, link) {
        if (!link) {
            console.log(url);
            link = new Link({url: url, creator: userid});
        }
        link.title = title;
        if (tags) {
            link.tags = _.map(tags.split(","), function(tag) {
                return tag.trim();
            });
        }
        link.private = priv;
        link.created = date;
        link.save(function (e) {
            if (e) {
                console.log(url, e);
            }
        });
        return;
    });
}

User.findOne({username: 'sigurdga'}).exec(function (err, user) {

    fs.readFile('/home/sigurdga/Nedlastinger/delicious.html', 'utf-8', function(err, data) {
        jsdom.env(data, function (err, window) {
            console.log(err);
            console.log("start");
            var bookmarks = window.document.getElementsByTagName("a");
            _.each(bookmarks, function (bookmark) {
                var url = bookmark.getAttribute("href"),
                    date = bookmark.getAttribute("add_date"),
                    tags = bookmark.getAttribute("tags"),
                    priv = bookmark.getAttribute("private"),
                    title = bookmark.innerHTML;

                createOrUpdateLink(url, title, date, priv, tags, user._id);
            });
            process.exit(code=0);
        });
    });
});

