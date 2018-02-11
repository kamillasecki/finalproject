var post = require('../models/post.js');
var reply = require('../models/reply.js');
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
                p.header.votes.num = 0;
                p.header.votes.upVotes = [];
                p.header.votes.downVotes = [];
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
    post.findOne({ '_id': requestedPostId })
        .populate('settings.author', 'displayname')
        .populate({
            path: 'replies',
            model: 'Reply',
            populate: [{
                    path: 'author',
                    model: 'User',
                    select: 'displayname'
                },
                {
                    path: 'rreplies',
                    model: 'Reply',
                    populate: {
                        path: 'author',
                        select: 'displayname'
                    }
                }
            ]
        })
        .exec(function(err, doc) {
            if (err) { console.log('Error while trying to get post from the database'); }
            else if (doc == null || doc == undefined || doc == "") {
                console.log("Post doesn't exist");
                //res.send("Post doesn't exist");
                res.render('notfound.ejs');
            }
            else {
                console.log(doc);
                res.send(doc);
            }
        });
};

exports.upvote = function(req, res) {
    console.log('Your debug req: ' + JSON.stringify(req.user));
    var requestedPostId = req.params.pid;
    var alreadyUpVoted = false;
    var alreadyDownVoted = -1;
    post.findOne({ '_id': requestedPostId }).exec(function(err, p) {
        if (err) {
            console.log('Error while trying to get post from the database');
            res.render('notfound.ejs');
        }
        else {
            for (var i = 0; i < p.header.votes.upVotes.length; i++) {
                if (p.header.votes.upVotes[i] == req.user._id) {
                    alreadyUpVoted = true;
                }
            }
            if (alreadyUpVoted) {
                console.log("Already upvoted by the user ... not upvoting");
                var r = {};
                r.n = null;
                r.m = "You have previously upvoted this post.";
                res.send(r);
            }
            else {
                console.log("Not yet voted, processing... upvote");
                for (var j = 0; j < p.header.votes.downVotes.length; j++) {
                    if (p.header.votes.downVotes[i] == req.user._id) {
                        alreadyDownVoted = j;
                    }
                }
                if (alreadyDownVoted != -1) {
                    console.log("downvoted prviously, processing... upvote");
                    //remove user from downvote
                    p.header.votes.downVotes.splice(alreadyDownVoted, 1);
                    //add user to upvote
                    p.header.votes.upVotes.push(req.user._id);
                    //add 2 to vote number
                    p.header.votes.num += 2;
                    p.save();
                    var r = {};
                    r.n = p.header.votes.num;
                    r.m = "";
                    res.send(r);
                }
                else {
                    console.log("not downvoted prviously, processing... upvote" + requestedPostId);
                    //add user to upvote
                    p.header.votes.upVotes.push(req.user._id);
                    //add 1 to vote number
                    p.header.votes.num += 1;
                    p.save();
                    var r = {};
                    r.n = p.header.votes.num;
                    r.m = "";
                    res.send(r);
                }
            }
        }

    });
};

exports.downvote = function(req, res) {
    var requestedPostId = req.params.pid;
    var alreadyUpVoted = -1;
    var alreadyDownVoted = false;
    var r = {};
    post.findOne({ '_id': requestedPostId }).exec(function(err, p) {
        if (err) {
            console.log('Error while trying to get post from the database');
            res.render('notfound.ejs');

        }
        else {
            for (var i = 0; i < p.header.votes.downVotes.length; i++) {
                if (p.header.votes.downVotes[i] == req.user._id) {
                    alreadyDownVoted = true;
                }
            }
            if (alreadyDownVoted) {
                console.log("Already downvoted by the user... not downvoting");
                r.n = null;
                r.m = "You have previously downvoted this post.";
                res.send(r);
            }
            else {
                console.log("Not yet downvoted, processing... downvote");
                for (var j = 0; j < p.header.votes.upVotes.length; j++) {
                    if (p.header.votes.upVotes[i] == req.user._id) {
                        alreadyUpVoted = j;
                    }
                }
                if (alreadyUpVoted != -1) {
                    console.log("upvoted prviously, processing... downvote");
                    //remove user from upvotes
                    p.header.votes.upVotes.splice(alreadyDownVoted, 1);
                    //add user to downvotes
                    p.header.votes.downVotes.push(req.user._id);
                    //substract 2 from the vote number
                    p.header.votes.num -= 2;
                    p.save();
                    r.n = p.header.votes.num;
                    r.m = "";
                    res.send(r);
                }
                else {
                    console.log("not upvoted prviously, processing... downvote" + requestedPostId);
                    //add user to downvote
                    p.header.votes.downVotes.push(req.user._id);
                    //substract 1 from the vote number
                    p.header.votes.num -= 1;
                    p.save();
                    r.n = p.header.votes.num;
                    r.m = "";
                    res.send(r);
                }
            }
        }

    });
};

exports.upvoteRep = function(req, res) {
    console.log('Your debug req: ' + JSON.stringify(req.user));
    var requestedRepId = req.params.rid;
    var alreadyUpVoted = false;
    var alreadyDownVoted = -1;
    reply.findOne({ '_id': requestedRepId }).exec(function(err, r) {
        if (err) {
            console.log('Error while trying to get post from the database');
            res.render('notfound.ejs');
        }
        else {
            var fb = {};
            for (var i = 0; i < r.votes.upVotes.length; i++) {
                if (r.votes.upVotes[i] == req.user._id) {
                    alreadyUpVoted = true;
                }
            }
            if (alreadyUpVoted) {
                console.log("Already upvoted by the user ... not upvoting");
                fb.n = null;
                fb.m = "You have previously upvoted this post.";
                res.send(fb);
            }
            else {
                console.log("Not yet voted, processing... upvote");
                for (var j = 0; j < r.votes.downVotes.length; j++) {
                    if (r.votes.downVotes[i] == req.user._id) {
                        alreadyDownVoted = j;
                    }
                }
                if (alreadyDownVoted != -1) {
                    console.log("downvoted prviously, processing... upvote");
                    //remove user from downvote
                    r.votes.downVotes.splice(alreadyDownVoted, 1);
                    //add user to upvote
                    r.votes.upVotes.push(req.user._id);
                    //add 2 to vote number
                    r.votes.num += 2;
                    r.save();
                    fb.n = r.votes.num;
                    fb.m = "";
                    res.send(fb);
                }
                else {
                    console.log("not downvoted prviously, processing... upvote" + requestedRepId);
                    //add user to upvote
                    r.votes.upVotes.push(req.user._id);
                    //add 1 to vote number
                    r.votes.num += 1;
                    r.save();
                    fb.n = r.votes.num;
                    fb.m = "";
                    res.send(fb);
                }
            }
        }

    });
};

exports.downvoteRep = function(req, res) {
    var requestedRepId = req.params.rid;
    var alreadyUpVoted = -1;
    var alreadyDownVoted = false;
    reply.findOne({ '_id': requestedRepId }).exec(function(err, r) {
        if (err) {
            console.log('Error while trying to get post from the database');
            res.render('notfound.ejs');
        }
        else {
            var fb = {};
            for (var i = 0; i < r.votes.downVotes.length; i++) {
                if (r.votes.downVotes[i] == req.user._id) {
                    alreadyDownVoted = true;
                }
            }
            if (alreadyDownVoted) {
                console.log("Already downvoted by the user... not downvoting");
                fb.n = null;
                fb.m = "You have previously downvoted this post.";
                res.send(fb);
            }
            else {
                console.log("Not yet downvoted, processing... downvote");
                for (var j = 0; j < r.votes.upVotes.length; j++) {
                    if (r.votes.upVotes[i] == req.user._id) {
                        alreadyUpVoted = j;
                    }
                }
                if (alreadyUpVoted != -1) {
                    console.log("upvoted prviously, processing... downvote");
                    //remove user from upvotes
                    r.votes.upVotes.splice(alreadyDownVoted, 1);
                    //add user to downvotes
                    r.votes.downVotes.push(req.user._id);
                    //substract 2 from the vote number
                    r.votes.num -= 2;
                    r.save();
                    fb.n = r.votes.num;
                    fb.m = "";
                    res.send(fb);
                }
                else {
                    console.log("not upvoted prviously, processing... downvote" + requestedRepId);
                    //add user to downvote
                    r.votes.downVotes.push(req.user._id);
                    //substract 1 from the vote number
                    r.votes.num -= 1;
                    r.save();
                    fb.n = r.votes.num;
                    fb.m = "";
                    res.send(fb);
                }
            }
        }

    });
};

exports.prep = function(req, res) {
    console.log("start processung reply...");
    var postId = req.params.id;
    var cal = {};
    post.findOne({ _id: postId }).exec(function(err, p) {
        if (err) { 
            res.render('notfound.ejs');
            console.log('Error while trying to get post from the database'); 
        }
        else if (p == null || p == undefined || p == "") {
            //connection to DB successfull
            console.log("No such a post exists");
            res.render('notfound.ejs');
        }
        else {
            var r = new reply();
            r.author = new mongoose.Types.ObjectId(req.user._id);
            r.text = req.body.m;
            r.replies = [];
            r.votes = {};
            r.votes.num = 0;
            r.votes.upVotes = [];
            r.votes.downVotes = [];
            r.save(function(err, rep) {
                if (err) {
                    console.log("Error when saving new reply: " + err);
                }
                console.log("Saved new post: " + rep._id);
                p.replies.push(mongoose.Types.ObjectId(rep._id));
                p.save();
                res.end();
            });
            //res.end("OK");
        }
    });
};

exports.rrep = function(req, res) {
    console.log("start processung reply...");
    var repId = req.params.id;
    reply.findOne({ _id: repId }).exec(function(err, p) {
        if (err) { console.log('Error while trying to get reply from the database'); }
        else if (p == null || p == undefined || p == "") {
            res.render('notfound.ejs');
        }
        else {
            var r = new reply();
            r.author = new mongoose.Types.ObjectId(req.user._id);
            r.text = req.body.m;
            r.votes = {};
            r.votes.num = 0;
            r.votes.upVotes = [];
            r.votes.downVotes = [];
            r.save(function(err, rrep) {
                if (err) {
                    console.log("Error when saving new reply: " + err);
                }
                console.log("Saved new reply: " + rrep._id);
                p.rreplies.push(mongoose.Types.ObjectId(rrep._id));
                p.save();
                res.end();
            });
            //res.end("OK");
        }
    });
};
