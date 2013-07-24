// Handlebars helpers

module.exports.register = function(hbs) {
	hbs.registerHelper('example', function(text){
		return "EXAMPLE: " + text;
	});
};