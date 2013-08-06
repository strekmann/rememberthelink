var mongoose = require('mongoose');
var TagSchema = require('./index').TagSchema;

var LinkSchema = new mongoose.Schema({
    url: {type: String, lowercase: true, trim: true, required: true},
    content: {type: String},
    title: {type: String},
    description: {type: String},
    'private': {type: Boolean, 'default': false},
    tags: [TagSchema],
    creator: {type: String, required: true, ref: 'User'},
    created: {type: Date, required: true, 'default': Date.now}
});

LinkSchema.index({url: 1, creator: 1}, {unique: true});

var Link = mongoose.model('Link', LinkSchema);

module.exports = {
    Link: Link
};
