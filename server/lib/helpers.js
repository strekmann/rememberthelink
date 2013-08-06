// Handlebars helpers
var moment = require('moment');

module.exports.register = function(hbs) {
	hbs.registerHelper('example', function(text){
		return "EXAMPLE: " + text;
	});

    //  http://momentjs.com/
    //  usage: {{date creation_date format="MMMM YYYY"}}
    hbs.registerHelper('dateformat', function(context, block) {
        var f = block.hash.format || "YYYY-MM-DD HH:mm";
        return moment(Date(context)).format(f);
    });
};
