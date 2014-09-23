#!/usr/bin/env node

var async = require('async'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    redis = require('../server/lib/redisclient'),
    Link = require('../server/models/links').Link,
    settings = require('../server/settings'),
    prefix = settings.redis.prefix || "rtl";

mongoose.connect(settings.mongo.servers.join(','), {replSet: {rs_name: settings.mongo.replset}});

async.waterfall([
    // cleanup
    function (callback) {
        redis.keys(prefix + '_*', function (err, keys) {
            async.eachLimit(keys, 10, function (key, callback) {
                redis.del(key, function (err) {
                    callback(err);
                });
            }, function (err) {
                callback(err);
            });
        });
    },
    // build structure
    function (callback) {
        var tags = {},
            urls = {},
            user_tags = {};

        Link.find(function (err, links) {
            if (err) {
                console.error(err);
                return process.exit(1);
            }
            _.each(links, function (link) {
                if (link.private) {
                    return;
                }
                urls[link.url] = urls[link.url] || 0;
                urls[link.url] += 1;

                _.each(link.tags, function (tag) {
                    tags[tag] = tags[tag] || 0;
                    tags[tag] += 1;

                    user_tags[link.creator] = user_tags[link.creator] || {};
                    user_tags[link.creator][tag] = user_tags[link.creator][tag] || 0;
                    user_tags[link.creator][tag] += 1;
                });
            });
            callback(null, urls, tags, user_tags);
        });
    },
    // populate redis
    function (urls, tags, user_tags, callback) {
        _.each(urls, function (count, url) {
            redis.zadd(prefix + '_urls', count, url);
        });
        _.each(tags, function (count, tag) {
            redis.zadd(prefix + '_tags', count, tag);
        });
        _.each(user_tags, function (tags, uid) {
            _.each(tags, function (count, tag) {
                redis.zadd(prefix + '_tags_' + uid, count, tag);
            });
        });
        callback();
    }
], function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    process.exit(0);
});
