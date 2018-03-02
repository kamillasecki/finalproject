var post = require('../models/post.js');
var reply = require('../models/reply.js');
var category = require('../models/category.js');
var notification = require('../models/notification.js');
var mongoose = require('mongoose');

//create new post
exports.count = function(id){
    notification.count({owner:id}, function(err,c){
        if(err){
            console.log(err);
        } else { 
            console.log("C: " + c);
            return  c;
        }
    });
};