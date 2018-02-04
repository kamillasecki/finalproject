var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var replySchema = mongoose.Schema({
    author: String,
    text: String,
    replies: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    vote: Number,
    createdAt: {type: Date, default: Date.now()}
});

replySchema.virtual('createdAtWords').get(function() {
    return moment(this.createdAt).fromNow();
});



// create the model for users and expose it to our app
module.exports = mongoose.model('Reply', replySchema);