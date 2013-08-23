// Handlebars helpers
var moment = require('moment');

var moment = require('moment');

module.exports.register = function(hbs) {
    //  usage: {{datetimeformat creation_date format="MMMM YYYY"}}
    hbs.registerHelper('datetimeformat', function(context, options) {
        var f = options.hash.format || "YYYY-MM-DD HH:mm";
        if (!context) {
            return '';
        }
        return moment(context).format(f);
    });

    hbs.registerHelper('ago', function(context) {
        if (!context) {
            return '';
        }
        return moment(context).fromNow();
    });
    hbs.registerHelper('canRead', function(user, options) {
        if (!this.private || user._id === this.creator._id) {
            return options.fn(this);
        }
    });
    hbs.registerHelper('canChange', function(user, options) {
        if (user && this.creator && user._id === this.creator._id) {
            return options.fn(this);
        }
    });
};
