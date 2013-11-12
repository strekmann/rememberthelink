// -- import configuration
var mongoose = require('mongoose'),
    fs = require('fs'),
    import_all = require('./lib/migration').import_all,
    conf = require('../server/settings/config'),
    settings = conf.config;

mongoose.connect('mongodb://localhost/' + conf.config.db_name);

function finish() {
    process.exit();
}

var filename = process.argv[2];
if (filename) {
    fs.readFile(filename, function (err, contents) {
        if (err) {
            throw err;
        }
        var users = JSON.parse(contents).users;
        import_all(users, function (err, statistics) {
            if (err) {
                console.log(err);
            } else {
                console.log(statistics);
            }
            finish();
        });
    });
} else {
    console.log("Please provide a filename to restore from.");
    finish();
}
