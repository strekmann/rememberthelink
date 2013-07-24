var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: Number},
    google_email: {type: String},
    google_link: {type: String},
    google_picture: {type: String}
});
UserSchema.virtual('username').get(function() {
    return this._id;
});
UserSchema.virtual('username').set(function(username) {
    this._id = username;
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
};