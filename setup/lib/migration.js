var async = require('async'),
    _ = require('underscore'),
    redis = require('../../server/lib/redisclient'),
    clean_link = require('../../server/routes/links').clean_link,
    User = require('../../server/models').User,
    Link = require('../../server/models/links').Link;

module.exports.export_all = function (callback) {
    User.find({}).exec(function (err, users) {
    async.map(
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
};

module.exports.import_all = function (users, callback) {
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
                                        dblink.creator = dbuser._id;
                                        dblink.created = new Date(link.created);
                                        if (link.title) {
                                            dblink.title = link.title;
                                        }
                                        if (link.description) {
                                            dblink.description = link.description;
                                        }
                                        if (link.tags && link.tags.length) {
                                            dblink.tags = link.tags;
                                            async.each(
                                                dblink.tags,
                                                function (tag, callback) {
                                                    tag = tag.trim();
                                                    if (tag.length > 0) {
                                                        redis.zincrby('tags', 1, tag);
                                                        redis.zincrby('tags_' + dbuser._id, 1, tag);
                                                    }
                                                    callback(null);
                                                },
                                                function (err) {
                                                }
                                            );
                                        }
                                    }
                                    dblink.save(function (err) {
                                        if (err) {
                                            callback(err, 0);
                                        } else {
                                            redis.zincrby('urls', 1, dblink.url);
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
        function (err, statistics) {
            callback(err, statistics);
        });
};

