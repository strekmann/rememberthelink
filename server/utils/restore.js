// -- import configuration
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
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
    fs.readFile(filename, function (err, contents) {
        if (err) {
            throw err;
        }
        var users = JSON.parse(contents).users;
        async.map(
            users,
            function (user, callback) {
                User.findOne({_id: user.id}).exec(function (err, dbuser) {
                    if (!dbuser) {
                        dbuser = new User();
                        dbuser._id = user.id;
                        dbuser.email = user.email;
                        dbuser.username = user.username;
                        dbuser.followers = user.followers;
                        dbuser.follows = user.follows;
                        dbuser.created = new Date(user.created);
                    }
                    dbuser.save(function (err) {
                        if (err) {
                            callback(err, 0);
                        } else {
                            async.map(
                                user.links,
                                function (link, callback) {
                                    Link.findOne({creator: dbuser._id, url:link.url}).exec(function (err, dblink) {
                                        if (!dblink) {
                                            dblink = new Link();
                                            dblink.url = link.url;
                                            dblink.created = new Date(link.created);
                                            if (link.title) {
                                                dblink.title = link.title;
                                            }
                                            if (link.description) {
                                                dblink.description = link.description;
                                            }
                                            if (link.tags.length) {
                                                dblink.tags = link.tags;
                                            }
                                        }
                                        dblink.save(function (err) {
                                            if (err) {
                                                callback(err, 0);
                                            } else {
                                                callback(null, 1);
                                            }
                                        });
                                    });
                                },
                                function (err, results) {
                                    var good = _.filter(results, function (status) {
                                        return status;
                                    });
                                    callback(err, dbuser.username + ": " + good.length);
                                });
                        }
                    });
                });
            },
            function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(results);
                }
                finish();
            });
    });
} else {
    console.log("Please provide a filename to restore from.");
    finish();
}
