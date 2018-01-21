var post = require('../models/post.js');
var mongoose = require('mongoose');

exports.newPost = function(req, res) {
    console.log('Your debug req: ' + JSON.stringify(req.body));
    var p = new post();
    p.settings.author = new mongoose.Types.ObjectId(req.user._id);
    p.settings.category = new mongoose.Types.ObjectId(req.body.category);
    p.settings.privacy = req.body.privacy;
    p.body.text = req.body.text;
    p.header.subject = req.body.subject;
    console.log('post object: ' + p);
}