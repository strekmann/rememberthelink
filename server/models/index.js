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
    google_email: {type: String},
    google_link: {type: String},
    google_picture: {type: String},
    following: [UserSchema],
    followers: [UserSchema]
});

var TagSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true}
});

var User = mongoose.model('User', UserSchema);
var Tag = mongoose.model('Tag', TagSchema);

module.exports = {
    User: User,
    Tag: Tag,
    TagSchema: TagSchema
};
