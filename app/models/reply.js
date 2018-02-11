var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var replySchema = mongoose.Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
    votes: {
            num: Number,
            upVotes: [String],
            downVotes: [String]
        },
    createdAt: {type: Date, default: Date.now}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

replySchema.virtual('createdAtWords').get(function() {
    return moment(this.createdAt).fromNow();
});



// create the model for users and expose it to our app
module.exports = mongoose.model('Reply', replySchema);