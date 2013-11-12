// -- import configuration
var mongoose = require('mongoose'),
    fs = require('fs'),
    conf = require('../settings/config'),
    export_all = require('./lib/migration').export_all,
    settings = conf.config;

mongoose.connect('mongodb://localhost/' + conf.config.db_name);

function finish() {
    process.exit();
}

var filename = process.argv[2];
if (filename) {
    export_all(function (err, users) {
        fs.writeFile(filename, JSON.stringify({users: users}), finish);
    });
} else {
    console.log("Please provide a filename to backup to.");
    finish();
}
