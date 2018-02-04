var post = require('../models/post.js');
var category = require('../models/category.js');
var mongoose = require('mongoose');

exports.newPost = function(req, res) {
    console.log('Your debug req: ' + JSON.stringify(req.body));
    category.findOne({ '_id': req.body.category }).exec(function(err, doc) {

        if (err) { console.log('Error while trying to get category from database'); }
        if (doc == null || doc == undefined || doc == "") {
            console.log("No such a parent category exists");
            res.writeHead(302, {
                'Location': '404'
            });
            res.redirect('/post?id=5a650c8bb62a0c8536f056c7');
            res.end();
        }
        else {
            if (req.body.privacy == "" || req.body.privacy == null || req.body.privacy == undefined) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("You have to choose the privacy setting");
            }
            else if (req.body.text == "" || req.body.text == null || req.body.text == undefined) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("Seems like the text of the post is missing, you have to write something.");
            }
            else if (req.body.subject == "" || req.body.subject == null || req.body.subject == undefined) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("Seems like the subject of the post is missing, you have to provide one.");
            }
            else {
                var p = new post();
                p.settings.author = new mongoose.Types.ObjectId(req.user._id);
                p.settings.category = new mongoose.Types.ObjectId(req.body.category);
                p.settings.privacy = req.body.privacy;
                p.settings.encryption.isEnabled = req.body.encryption;
                if (p.settings.encryption.isEnabled) {
                    p.settings.encryption.checkword = req.body.checkword;
                }
                p.body.text = req.body.text;
                p.header.subject = req.body.subject;
                console.log('post object: ' + p);
                p.save(function(err, newPost) {
                    if (err) {
                        console.log("Error when saving new post: " + err);
                    }
                    console.log("Saved new post: " + newPost._id);
                    doc.postsId.push(mongoose.Types.ObjectId(newPost._id));
                    doc.save();
                });
            }
        }
    });
};

exports.getPost = function(req, res) {
    console.log('Your debug req: ' + JSON.stringify(req.body));
    var requestedPostId = req.params.id;
    post.findOne({ '_id': requestedPostId }).exec(function(err, doc) {
        if (err) { console.log('Error while trying to get post from the database'); }
        else if (doc == null || doc == undefined || doc == "") {
            console.log("Post doesn't exist");
            res.send("Post doesn't exist");
        }
        else {
            res.send(doc)
        }
    });

};
