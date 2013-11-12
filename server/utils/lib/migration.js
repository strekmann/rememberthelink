var async = require('async'),
    clean_link = require('../../routes/links').clean_link,
    User = require('../../models').User,
    Link = require('../../models/links').Link;

var export_all = function (callback) {
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
module.exports.export_all = export_all;
