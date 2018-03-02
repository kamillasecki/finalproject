var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require("moment");


// define the schema for our user model
var notificationSchema = mongoose.Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    type: {
            type: String,
            enum: ['info', 
                'newRequest', 
                'requestDen', 
                'requestAcc', 
                'newFollowedRep', 
                'newMessage', 
                'newInvite',
                'inviteDen', 
                'inviteAcc'],
            default: 'info'
        },
    message: String,
    createdAt: { type: Date, default: Date.now},
    hasRead: { type: Boolean, default: false}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

notificationSchema.virtual('createdAtWords').get(function() {
    return moment(this.createdAt).fromNow();
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Notification', notificationSchema);
