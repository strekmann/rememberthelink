var app = require('../../server/app.js');
var mongoose = require('mongoose');
var request = require('supertest');
var chai = require('chai');
chai.should();

app.db = mongoose.connect('mongodb://localhost/' + app.conf.db_name + '_test');
app.db.connection.db.dropDatabase();

global.app = app;
global.expect = chai.expect;
global.assert = chai.assert;
global.request = request;
