var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    username: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: String},
    facebook_id: {type: String},
    following: [UserSchema],
    followers: [UserSchema]
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
};
