var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    username: {type: String, lowercase: true, trim: true, unique: true, sparse: true},
    name: {type: String, required: true},
    email: {type: String},
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    password: {type: String},
    algorithm: {type: String},
    salt: {type: String},
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
