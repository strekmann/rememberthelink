/*
	i18n grunt task
	fint translation and add them to locale files
*/

function getMatches(re, str) {
	var matches = [],
		match;

	while (match = re.exec(str)) {
		matches.push(match[1]);
	}
	return matches;
}

function getPluralMatches(re, str) {
	var matches = [],
		match;

	while (match = re.exec(str)) {
		matches.push({singular: match[1], plural: match[2]});
	}
	return matches;
}

module.exports = function(grunt){
	var i18n = require('i18n'),
		path = require('path'),
		config = require('../server/settings');

	i18n.configure({
        locales: config.i18n.locales,
        defaultLocale: config.i18n.defaultLocale,
        cookie: 'locale',
        directory: path.join(__dirname, "..", "server", "locales"),
        extension: '.js',
        indent: "    ",
        updateFiles: true
    });

	grunt.registerMultiTask('i18n', 'Populate i18n locale files', function() {
		// translations containing ' or " will mess with us >_<
		var options = this.options({
			singlejs: /__\(["|'](.+?)["|']\)/g,
			singlehbs: /__\s+["|'](.+?)["|']/g,
			pluraljs: /__n\(["|'](.+?)["|']\s*,\s*["|'](.+?)["|']\)/g,
			pluralhbs: /__n\s+["|'](.+?)["|']\s+["|'](.+?)["|']/g
		});

		this.files.forEach(function(f){
			// filter sources
			var src = f.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
		        	grunt.log.warn('Source file "' + filepath + '" not found.');
		        	return false;
		        } else {
		        	return true;
		        }
			});

			src.forEach(function(filepath){
				var content = grunt.file.read(filepath);

				// single translations __(..) and {{__ ""}}
				var hits = getMatches(options.singlejs, content);
				hits = hits.concat(getMatches(options.singlehbs, content));
				hits.forEach(function(hit){
					config.i18n.locales.forEach(function(locale){
						i18n.setLocale(locale);
						i18n.__(hit);
					});
				});

				// plural translations __n(..,..) and {{__n "" ""}}
				var hits = getPluralMatches(options.pluraljs, content);
				hits = hits.concat(getPluralMatches(options.pluralhbs, content));
				hits.forEach(function(hit){
					config.i18n.locales.forEach(function(locale){
						i18n.setLocale(locale);
						i18n.__n(hit.singular, hit.plural, 1);
					});
				});
			});
		});
	});
};