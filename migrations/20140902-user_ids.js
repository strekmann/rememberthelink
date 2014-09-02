#!/usr/bin/env node

var shortid = require('short-mongo-id'),
    mongoose = require('mongoose'),
    User = require('../server/models').User,
    _ = require('underscore'),
    async = require('async'),
    settings = require('../server/settings');

mongoose.connect(settings.mongo.servers.join(','), {replSet: {rs_name: settings.mongo.replset}});

async.series([
        // Delete old indexes
        function(cb){
            console.log('Dropping indexes');
            User.collection.dropAllIndexes(function(err, results){
                console.log(results)
                cb(err);
            });
        },

        // Update all users
        function(cb){
            User.find({}).exec(function(err, users){
                if (err) {
                    console.error(err);
                    return cb(err);
                }

                var map = {};
                _.each(users, function(user){
                    map[user._id] = shortid();
                });

                async.eachLimit(users, 5, function(user, done){
                    var newUser = user.toObject();
                    newUser._id = map[user._id];
                    newUser.followers = _.map(user.followers, function(follower){
                        return map[follower];
                    });
                    newUser.following = _.map(user.following, function(follows){
                        return map[follows];
                    });
                    delete newUser.username;

                    User.create(newUser, function(err){
                        if (err){ return done(err); }

                        user.remove(function(err){
                            done(err);
                        });
                    });

                    //user.update(function(err){
                    //});

                }, function(err){
                    cb(err);
                });
            });
        }

    // All done
    ], function(err, res){
        if (err){
            console.error(err);
        }
        process.exit(0);
});

