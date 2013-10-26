if (process.env.NODE_ENV === "test") {
	var redis = require('fakeredis');
	module.exports = redis.createClient();
} else {
	var redis = require('redis');
	module.exports = redis.createClient();
}