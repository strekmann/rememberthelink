// Handlebars helpers
var moment = require('moment'),
    _ = require('underscore');

module.exports.register = function(app, hbs) {
    // -- date stuff - moment
    //  usage: {{datetimeformat creation_date format="MMMM YYYY"}}
    hbs.registerHelper('datetimeformat', function(context, options) {
        if (!context) {
            return '';
        }
        var f = options.hash.format || "YYYY-MM-DD HH:mm";
        return moment(context).format(f);
    });

    hbs.registerHelper('ago', function(context) {
        if (!context) {
            return '';
        }
        return moment(context).fromNow();
    });


    // -- user rights
    hbs.registerHelper('canRead', function(user, options) {
        if (!this.private || user._id === this.creator._id) {
            return options.fn(this);
        }
    });

    hbs.registerHelper('canChange', function(user, options) {
        if (user && (this.creator && user._id === this.creator._id || (this.to === user.username))) {
            return options.fn(this);
        }
    });

    hbs.registerHelper('doesnotfollow', function(user, options) {
        var other = this;
        if (other.username && user && user.username) {
            // can't follow yourself
            if (other.username === user.username) {
                return false;
            }

            var match = _.find(user.following, function(name){
                return name.username===other.username;
            });
            if (!match) {
                return options.fn(this);
            }
        }
        return false;
    });

    hbs.registerHelper('dump', function(value){
        console.log(value);
    });

    // -- i18n
    hbs.registerHelper('__', function () {
        return app.i18n.__.apply(this, arguments);
    });

    hbs.registerHelper('__n', function () {
        return app.i18n.__n.apply(this, arguments);
    });

    hbs.registerHelper('displayurl', function (url) {
        return url.replace(/^\w+:\/\/(?:www\.)?/, '');
    });
};
