var cheerio = require("cheerio");
var app = require('./app');
var mongoose = require('mongoose');
app.db = mongoose.connect('mongodb://localhost/' + app.conf.db_name);

var fs = require("fs"),
_ = require("underscore");
User = require('./models').User,
Tag = require('./models').Tag,
Link = require('./models/links').Link;

User.findOne({username: 'sigurdga'}).exec(function (err, user) {

    console.log("eost");
    var data = fs.readFileSync('/home/sigurdga/Nedlastinger/delicious.html');
    console.log("ost");
    $ = cheerio.load(data);
    console.log($('a'));
});

