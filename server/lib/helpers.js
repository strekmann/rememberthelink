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

    // -- i18n
    hbs.registerHelper('__', function () {
        return app.i18n.__.apply(this, arguments);
    });

    hbs.registerHelper('__n', function () {
        return app.i18n.__n.apply(this, arguments);
    });

};
