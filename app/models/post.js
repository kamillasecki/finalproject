var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var reply = mongoose.Schema({
    author: String,
    text:String,
    replies: [reply],
    vote : Number
},{
    timestamps: true
});

// define the schema for our user model
var postSchema = mongoose.Schema({
    settings : {
        privacy : String,
        author : String,
    },
    header: {
        subject: String,
    },
    body : {
        text : String
    },
    replies: [reply]
}, {
    timestamps: true
});

// methods ======================


// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);