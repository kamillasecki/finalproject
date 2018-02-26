var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require("moment");


// define the schema for our user model
var postSchema = mongoose.Schema({
    settings: {
        privacy: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        encryption: { isEnabled: Boolean, checkword: String },
        isAdmin: Boolean,
        isRequested: Boolean,
        isAllowed: Boolean,
        access: {
            admin: [{ type: Schema.Types.ObjectId, ref: 'User'}],
            allowed:[{ type: Schema.Types.ObjectId, ref: 'User'}],
            requested:[{ type: Schema.Types.ObjectId, ref: 'User'}],
            invited:[{ type: Schema.Types.ObjectId, ref: 'User'}]
        }
    },
    header: {
        subject: String,
        votes: {
            num: Number,
            upVotes: [String],
            downVotes: [String]
        }
    },
    body: {
        text: String,
        updates:[String]
    },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
    createdAt: { type: Date, default: Date.now}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

postSchema.virtual('createdAtWords').get(function() {
    return moment(this.createdAt).fromNow();
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);
