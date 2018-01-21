var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var user = require('../models/user.js');
var category = require('../models/category.js');

var reply = mongoose.Schema({
    author: String,
    text: String,
    replies: [reply],
    vote: Number
}, {
    timestamps: true
});

// define the schema for our user model
var postSchema = mongoose.Schema({
    settings: {
        privacy: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        category: { type: Schema.Types.ObjectId, ref: 'Category' }
    },
    header: {
        subject: String,
    },
    body: {
        text: String
    },
    replies: [reply]
}, {
    timestamps: true
});

// methods ======================


// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);