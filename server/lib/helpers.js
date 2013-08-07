// Handlebars helpers
var moment = require('moment');

module.exports.register = function(hbs) {
	hbs.registerHelper('example', function(text){
		return "EXAMPLE: " + text;
	});

    //  http://momentjs.com/
    //  usage: {{datetimeformat creation_date format="MMMM YYYY"}}
    hbs.registerHelper('datetimeformat', function(context, block) {
        var f = block.hash.format || "YYYY-MM-DD HH:mm";
        return moment(context).format(f);
    });
    hbs.registerHelper('ago', function(context) {
        return moment(context).fromNow();
    });
};
