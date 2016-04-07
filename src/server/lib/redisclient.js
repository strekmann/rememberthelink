var redis = require('redis');
var client = redis.createClient();
if (process.env.NODE_ENV === "test") {
    client.select(1);
}
module.exports = client;
