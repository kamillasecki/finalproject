var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var notification = require("../models/notification.js");

// define the schema for our user model
var userSchema = mongoose.Schema({
    displayname: String,
    local            : {
        username     : String,
        password     : String,
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

// methods ======================

//get number of notifications
userSchema.methods.getCount = function(cb) {
    notification.count({owner:this._id,hasRead:false}, function(err,c){
        if(err){
            console.log(err);
        } else { 
            console.log("C: " + c);
            cb(c);
        }
    });
};

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);