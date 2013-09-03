var cheerio = require("cheerio");
var app = require('./app');
var mongoose = require('mongoose');
app.db = mongoose.connect('mongodb://localhost/' + app.conf.db_name);

var fs = require("fs"),
_ = require("underscore");
User = require('./models').User,
Tag = require('./models').Tag,
Link = require('./models/links').Link;

function createOrUpdateLink(url, title, date, priv, tags, userid) {
    Link.findOne({url: url, creator: userid}, function (err, link) {
        if (err) {
            console.log(err);
        }
        if (!link) {
            console.log(url);
            link = new Link({url: url, creator: userid});
        }
        link.title = title;
        if (tags) {
            link.tags = _.map(tags.split(","), function(tag) {
                return new Tag({_id: tag.trim()});
            });
        }
        link.private = priv;
        link.created = date;
        //console.log(date);
        link.save(function (e) {
            if (e) {

                console.log(e);
                console.log(link);
            }
        });
        return;
    });
}

function parseit(part, user) {
    part.each(function (i, el) {

    var a = $(el);
    var url = a.attr('href');
    var date = new Date(a.attr('add_date') * 1000);
    var priv = a.attr('private');
    var tags = a.attr('tags');
    var title = a.text();

    if (url && /^http/.exec(url)) {

        createOrUpdateLink(url, title, date, priv, tags, user._id);
    }
    });
}

User.findOne({username: 'sigurdga'}).exec(function (err, user) {

    fs.readFile('/home/sigurdga/Nedlastinger/delicious.html', function(err, data) {
        if(err) throw err;
        var array = data.toString().split("\n");
        for(var i in array) {
            var line = array[i];
            $ = cheerio.load(line);
            var dt = $('dt a');
            parseit(dt, user);
        }
    });
});
