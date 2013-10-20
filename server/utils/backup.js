// -- import configuration
var mongoose = require('mongoose'),
    async = require('async'),
    fs = require('fs'),
    conf = require('../settings/config'),
    clean_link = require('../routes/links').clean_link,
    settings = conf.config;

mongoose.connect('mongodb://localhost/' + conf.config.db_name);
var User = require('../models').User,
    Link = require('../models/links').Link;

function finish() {
    process.exit();
}

var filename = process.argv[2];
if (filename) {
    async.series([ function (callback) {
        User.find({}).exec(function (err, users) {
            var all = async.map(
                users,
                function (user, callback) {
                    var new_user = {};
                    new_user.id = user._id;
                    new_user.email = user.email;
                    new_user.username = user.username;
                    new_user.followers = user.followers;
                    new_user.follows = user.follows;
                    new_user.created = user.created.getTime();
                    Link.find({creator: user._id}).exec(function (err, links) {
                        async.map(
                            links,
                            function(link, callback) {
                                callback(null, clean_link(link));
                            },
                            function (err, results) {
                                new_user.links = results;
                                callback(err, new_user);
                            });
                    });
                },
                function (err, users) {
                    callback(err, users);
                });
        });
    }],
    function (err, users) {
        fs.writeFile(filename, JSON.stringify(users), finish);
    });
} else {
    console.log("Please provide a filename to backup to.");
    finish();
}
