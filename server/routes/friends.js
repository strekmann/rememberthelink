var _ = require('underscore');
var ensureAuthenticated = require('../lib/middleware').ensureAuthenticated,
    User = require('../models').User;

// links routes
module.exports.index = function(req, res){
    User.findOne({_id: req.user._id})
    .populate('following followers')
    .exec(function (err, user) {
        console.log(user);
        res.render('friends/index', {
            followers: user.followers,  // strictly not necessary
            following: user.following,  // strictly not necessary
            user: req.user
        });
    });
};
