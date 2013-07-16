var app = require('../../server/app.js');
var request = require('supertest');
var chai = require('chai');
chai.should();

global.app = app;
global.expect = chai.expect;
global.assert = chai.assert;
global.request = request;
