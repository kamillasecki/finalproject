var post = require('../models/post.js');
var reply = require('../models/reply.js');
var category = require('../models/category.js');
var notification = require('../models/notification.js');
var mongoose = require('mongoose');

//create new post
exports.newPost = function(req, res) {
    category.findOne({ '_id': req.body.category }).exec(function(err, doc) {

        if (err || !doc) {
            res.status(406);
            res.send("Is teems that there was a problem with category you have chosen.");
        }
        else {
            if (req.body.privacy == "" || req.body.privacy == null || req.body.privacy == undefined) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("You have to choose the privacy setting");
            }
            else if (req.body.text.trim() == "" || req.body.text == null || req.body.text == undefined) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("Seems like the text of the post is missing, you have to write something.");
            }
            else if (req.body.subject.trim() == "" || req.body.subject == null || req.body.subject == undefined) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("Seems like the subject of the post is missing, you have to provide one.");
            }
            else {
                var p = new post();
                var me = new mongoose.Types.ObjectId(req.user._id);
                p.settings.author = me;
                p.settings.category = new mongoose.Types.ObjectId(req.body.category);
                p.settings.privacy = req.body.privacy;
                p.settings.encryption.isEnabled = req.body.encryption;
                if (p.settings.encryption.isEnabled) {
                    p.settings.encryption.checkword = req.body.checkword;
                }
                if (p.settings.privacy != "pub") {
                    p.settings.access.allowed = [];
                    p.settings.access.allowed.push(me);
                    p.settings.access.admin = [];
                    p.settings.access.admin.push(me);
                    if (p.settings.privacy == "cgh") {
                        p.settings.access.invited = [];
                        if (p.settings.privacy == "cgp") {
                            p.settings.access.requested = [];
                        }
                    }
                }

                p.body.text = req.body.text;
                p.body.updates = [];
                p.header.subject = req.body.subject;
                p.header.votes.num = 0;
                p.header.votes.upVotes = [];
                p.header.votes.downVotes = [];
                p.save(function(err, newPost) {
                    if (err) {
                        res.status(406);
                        res.send("An error occured when saving your post to the database. Please try again.");
                    }
                    doc.postsId.push(mongoose.Types.ObjectId(newPost._id));
                    doc.save();
                    res.status(200);
                    res.send(newPost._id);
                });
            }
        }
    });
};

exports.getPost = function(req, res) {
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
            if (err) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("An error on connection to the database occured");
                console.log(err)
            }
            else if (!doc) {
                res.setHeader("Content-Type", "text/html");
                res.status(404);
                res.send("No such a post exists.");
                console.log("no doc")
            }
            else if (doc.settings.privacy != "pub") {
                doc.settings.isAdmin = false;
                doc.settings.isRequested = false;
                doc.settings.isAllowed = false;
                if (req.user) {
                    //check if user is an admin
                    for (var i = 0; i < doc.settings.access.admin.length; i++) {
                        if (doc.settings.access.admin[i].toString() == req.user._id) {
                            doc.settings.isAdmin = true;
                        }
                    }

                    //check if user is allowed to access the post
                    for (var j = 0; j < doc.settings.access.allowed.length; j++) {
                        if (doc.settings.access.allowed[j].toString() == req.user._id) {
                            doc.settings.isAllowed = true;
                        }
                    }

                    //check if user is awaiting to get access to the post
                    for (var k = 0; k < doc.settings.access.requested.length; k++) {
                        if (doc.settings.access.requested[k].toString() == req.user._id) {
                            doc.settings.isRequested = true;
                        }
                    }
                }

                if (doc.settings.isAllowed) {
                    var resolve = function(a) {
                        console.log(a.settings.access.allowed);
                        res.send(a);
                    }
                    var reject = function(a) {
                        console.log(a);
                    }
                    console.log("is allowed")
                    if (doc.settings.isAdmin) {
                        doc.populate({
                            path: 'settings.access.allowed',
                            select: 'displayname',
                            model: 'User'
                        }).
                        execPopulate().then(resolve, reject);

                    }
                    else {
                        doc.settings.access = null;
                        res.send(doc);
                    }
                }
                else if (doc.settings.privacy == "cgp") {
                    console.log("testing");
                    doc.settings.access = null;
                    doc.body = null;
                    doc.replies = null;
                    res.send(doc);
                }
                else {
                    res.setHeader("Content-Type", "text/html");
                    res.status(404);
                    res.send("No such a post exists.");
                }
            }
            else {
                //post is public
                doc.settings.access = null;
                res.send(doc);
            }
        });
};

exports.upvote = function(req, res) {
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
                    if (p.header.votes.downVotes[j] == req.user._id) {
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
                    if (p.header.votes.upVotes[j] == req.user._id) {
                        alreadyUpVoted = j;
                    }
                }
                if (alreadyUpVoted != -1) {
                    console.log("upvoted prviously, processing... downvote");
                    //remove user from upvotes
                    p.header.votes.upVotes.splice(alreadyUpVoted, 1);
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
                fb.m = "You have previously upvoted this comment.";
                res.send(fb);
            }
            else {
                console.log("Not yet voted, processing... upvote");
                //searching for 
                for (var j = 0; j < r.votes.downVotes.length; j++) {
                    if (r.votes.downVotes[j] == req.user._id) {
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
                fb.m = "You have previously downvoted this comment.";
                res.send(fb);
            }
            else {
                console.log("Not yet downvoted, processing... downvote");
                for (var j = 0; j < r.votes.upVotes.length; j++) {
                    if (r.votes.upVotes[j] == req.user._id) {
                        alreadyUpVoted = j;
                    }
                }
                if (alreadyUpVoted != -1) {
                    console.log("upvoted prviously, processing... downvote");
                    //remove user from upvotes
                    r.votes.upVotes.splice(alreadyUpVoted, 1);
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
    var postId = req.params.id;
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
            //create new instance of reply
            var r = new reply();
            //add author's id form the session
            r.author = new mongoose.Types.ObjectId(req.user._id);
            //populate rst of the object
            r.text = req.body.m;
            r.replies = [];
            r.votes = {};
            r.votes.num = 0;
            r.votes.upVotes = [];
            r.votes.downVotes = [];
            //save the object to the DB
            r.save(function(err, rep) {
                if (err) {
                    throw(err);
                }
                //push an ID of newly created reply to the post's array
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
                p.rreplies.push(mongoose.Types.ObjectId(rrep._id));
                p.save();
                res.end();
            });
            //res.end("OK");
        }
    });
};

exports.pdel = function(req, res) {
    var id = req.params.id;
    var r = {};
    //find the post
    post.findOne({ _id: id }).exec(function(err, p) {
        if (err) { console.log('Error while trying to get post from the database'); }
        else if (!p) {
            res.render('notfound.ejs');
        }
        else if (p.replies.length != 0) {
            r.status = "error";
            r.m = "Cannot delete post with replies";
            res.send(r);
        }
        else if (p.settings.author.toString() == req.user._id) {
            //remove the post
            post.remove({ _id: id }, function(err) {
                if (err) {
                    res.status(404);
                    res.send('Error while trying to remove post from the database');
                }
                else {
                    //remove the refference to the post from the category
                    var cid = p.settings.category;
                    //search conditions
                    var conditions = { _id: cid };
                    //edit conditions
                    var update = { $pull: { postsId: mongoose.Types.ObjectId(id) } };
                    //edit options
                    var options = { multi: true };
                    //Execute query
                    category.update(conditions, update, options, function(err) {
                        if (err) {
                            throw(err);
                        }
                        else {
                            r.status = "ok";
                            r.m = "Your post has been removed";
                            res.send(r);
                        }
                    });
                    
                //remove all notifications reffering to deleted post
                    notification.remove({ post: id }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
        else {
            r.status = "error";
            r.m = "You are not authorized to remove this post";
            res.send(r);
        }
    });
};

exports.pedit = function(req, res) {
    var postId = req.params.id;
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
        else if (req.body.m == "" || req.body.m == null) {
            var r = {};
            r.status = "error";
            r.m = "Post cannot be empty.";
            res.send(r);
        }
        else {
            p.body.text = req.body.m;
            p.save(function(err, rep) {
                if (err) {
                    console.log("Error when saving new reply: " + err);
                    res.render('notfound.ejs');
                }
                else {
                    res.end();
                }
            });
        }
    });
};

exports.pupd = function(req, res) {
    var postId = req.params.id;
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
        else if (req.body.m == "" || req.body.m == null) {
            var r = {};
            r.status = "error";
            r.m = "Update cannot be empty.";
            res.send(r);
        }
        else {
            p.body.updates.push(req.body.m);
            p.save(function(err, rep) {
                if (err) {
                    console.log("Error when saving new edit: " + err);
                    res.render('notfound.ejs');
                }
                else {
                    console.log("Added new Edit to post: " + rep._id);
                    res.end();
                }
            });
        }
    });
};

exports.rdel = function(req, res) {
    var repId = req.params.rid;
    var posId = req.params.pid;
    reply.findOne({ _id: repId }).exec(function(err, r) {
        if (err) {
            res.render('notfound.ejs');
            console.log('Error while trying to get post from the database');
        }
        else if (!r) {
            //connection to DB successfull
            console.log("No such a reply exists");
            res.render('notfound.ejs');
        }
        else if (r.author.toString() == req.user._id) {
            if (r.rreplies.length > 0) {
                r.text="";
                r.isDeleted = true;
                r.save();
                res.status(200);
                res.send("Your reply has been removed");
            }
            else {
                reply.remove({ _id: repId }, function(err) {
                    if (err) {
                        console.log('Error while trying to remove reply from the database');
                        res.render('notfound.ejs');
                    }
                    else {
                        post.update({ _id: posId }, { $pull: { replies: mongoose.Types.ObjectId(repId) } }, { multi: true },
                            function(err) {
                                if (err) {
                                    console.log("Error when removing reply ref from post category:" + err);
                                }
                                else {
                                    res.status(200);
                                    res.send("Your reply has been removed");
                                }
                            });
                    }
                });
            }
        }
        else {
            res.status(400).end();
        }
    });
};

exports.redit = function(req, res) {
    var rId = req.params.id;
    reply.findOne({ _id: rId }).exec(function(err, r) {
        if (err) {
            res.render('notfound.ejs');
            console.log('Error while trying to get reply from the database');
        }
        else if (r == null || r == undefined || r == "") {
            //connection to DB successfull
            console.log("No such a reply exists");
            res.render('notfound.ejs');
        }
        else if (req.body.m == "" || req.body.m == null) {
            var f = {};
            f.status = "error";
            f.m = "Reply cannot be empty.";
            res.send(f);
        }
        else {
            r.text = req.body.m;
            r.save(function(err, rep) {
                if (err) {
                    console.log("Error when saving new edit: " + err);
                    res.render('notfound.ejs');
                }
                else {
                    console.log("Added new Edit to post: " + rep._id);
                    res.end();
                }
            });
        }
    });
};

exports.postByCat = function(req, res) {
    var cId = req.params.id;
    //check if cId is valid mongoose id
    if (mongoose.Types.ObjectId.isValid(cId)) {
        //get category from DB
        category.findOne({ _id: cId })
            .populate({
                path: 'postsId',
                select: '-body'
            }).exec(function(err, c) {
                if (err || !c) {
                    res.status(400).end();
                }
                else {
                    res.send(filterPosts(c.postsId, req.user));
                }
            });
    }
};

exports.rrdel = function(req, res) {
    var repId = req.params.id;
    var pid = req.params.pid;
    reply.findOne({ _id: repId }).exec(function(err, r) {
        if (err) {
            res.render('notfound.ejs');
            console.log('Error while trying to get post from the database');
        }
        else if (!r) {
            //connection to DB successfull
            console.log("No such a reply exists");
            res.render('notfound.ejs');
        }
        else if (r.author.toString() == req.user._id) {
            reply.remove({ _id: repId }, function(err) {
                if (err) {
                    console.log('Error while trying to remove reply from the database');
                    res.render('notfound.ejs');
                }
                else {
                    reply.update({ _id: pid }, { $pull: { rreplies: mongoose.Types.ObjectId(repId) } }, { multi: true },
                        function(err) {
                            if (err) {
                                console.log("Error when removing comment ref from reply: " + err);
                            }
                            else {
                                res.send("Your reply has been removed");
                            }
                        });
                }
            });
        }
        else {
            res.status(400).end();
        }
    });
};

exports.reqAccess = function(req, res) {
    var pId = req.params.id;
    post.findOne({ _id: pId }).exec(function(err, p) {
        if (err || !p) {
            res.render('notfound');
        }
        else {
            var fb = {};
            //check if already requested by the user
            var found = false;
            for (var i = 0; i < p.settings.access.requested.length; i++) {
                if (p.settings.access.requested[i].toString() == req.user._id) {
                    found = true;
                }
            }
            if (found) {
                fb.message = "You have already requeste access to this post.";
                fb.status = "message";
                res.send(fb);
            }
            else {
                //if not requested yet
                //add user id to the post object
                var me = new mongoose.Types.ObjectId(req.user._id);
                p.settings.access.requested.push(me);
                p.save(function(err) {
                    if (err) {
                        res.render('notfound');
                    }
                    else {
                        //create new notification
                        var n = new notification();
                        n.owner = p.settings.author;
                        n.creator = me;
                        n.post = new mongoose.Types.ObjectId(pId);
                        n.type = 'newRequest';
                        n.message = req.body.m;
                        n.save(function(err) {
                            if (err) {
                                console.log("error: " + err);
                                res.render('notfound.ejs');
                            }
                            else {
                                fb.status = "ok";
                                fb.message = "Your request has been created";
                                res.send(fb);
                            }
                        });
                    }
                });
            }
        }
    });
};

exports.findp = function(req, res) {
    post.find({ $text: { $search: req.params.search } })
        .populate('settings.category')
        .select('-body')
        .exec(function(err, p) {
            if (err) {
                console.log(err);
            }
            else {
                if (err || !p) {
                    res.status(400).end();
                }
                else {
                    console.log(filterPosts(p, req.user));
                    res.send(filterPosts(p, req.user));
                }
            }
        });
};

exports.changePrivSett = function(req, res) {
    var pid = req.params.id;
    var newStatus = req.body.s;
    var a = {};
    console.log(pid);

    post.findOne({ _id: pid }).exec(function(err, p) {
        if (newStatus != 'pub' && newStatus != 'cgh' && newStatus != 'cgp') {
            a.status = "Problem";
            a.message = "You have provided an incorrect privacy settings.";
            res.send(a);
        }
        else if (!p || err) {
            a.status = "Problem";
            a.message = "Requested post has been not found!";
            res.send(a);
        }
        else if (p.settings.author.toString() != req.user.id) {
            a.status = "Problem";
            a.message = "You are not authorized to invite users for this post.";
            res.send(a);
        }
        else if (p.settings.privacy == newStatus) {
            a.status = "Problem";
            a.message = "Requested new status is the same as current. No change has been applied.";
            res.send(a);
        }
        else if (newStatus == "pub") {
            if (p.settings.encryption.isEncrypted) {
                a.status = "Problem";
                a.message = "Encryption must be swiched off before making your post Public.";
                res.send(a);
            }
            else {
                //set new privacy
                p.settings.privacy = newStatus;
                //clear all the access controll
                p.settings.access.admin = [];
                p.settings.access.allowed = [];
                p.settings.access.requested = [];
                p.settings.access.invited = [];
                p.save(function(err) {
                    if (err) {
                        a.status = "Problem";
                        a.message = "Problem when saving new settings.";
                        res.send(a);
                    }
                    else {
                        //remove all notifications for this post 
                        notification.deleteMany({ 
                            post: p._id, type: 
                                { $in: ['newRequest', 'requestDen', 'requestAcc', 'newInvite', 'inviteDen', 'inviteAcc'] } }, function(err) {
                                    if (err) {
                                        a.status = "Problem";
                                        a.message = "Problem when deleting notifications.";
                                        res.send(a);
                                    }
                                    else {
                                        a.status = "Completed";
                                        a.message = "Your privacy settings has been applied.";
                                        res.send(a);
                                    }
                        });
                    }
                });
            }
        }
        else if (p.settings.privacy == "pub") {
            p.settings.privacy = newStatus;
            p.settings.access.admin = [p.settings.author];
            p.settings.access.allowed = [p.settings.access.allowed];
            p.settings.access.requested = [];
            p.settings.access.invited = [];
            p.save(function(err) {
                if (err) {
                    a.status = "Problem";
                    a.message = "Problem when saving new settings.";
                    res.send(a);
                }
                else {
                    a.status = "Completed";
                    a.message = "Your privacy settings has been applied.";
                    res.send(a);
                }
            });
        }
        else {
            p.settings.privacy = newStatus;
            p.save(function(err) {
                if (err) {
                    a.status = "Problem";
                    a.message = "Problem when saving new settings.";
                    res.send(a);
                }
                else {
                    a.status = "Completed";
                    a.message = "Your privacy settings has been applied.";
                    res.send(a);
                }
            })
        }
    });
};

exports.applyEncryption = function(req, res) {
    var pId = req.params.id;
    var encPost = req.body;

    //find the post
    var a = {};
    post.findOne({ _id: pId }).exec(function(err, p) {
        if (!p || err) {
            a.status = "Problem";
            a.message = "Requested post has been not found!";
            res.send(a);
        }
        //check users authorisation
        else if (p.settings.author.toString() != req.user.id) {
            a.status = "Problem";
            a.message = "You are not authorized to change settings of this post.";
            res.send(a);
        }
        else {
            p.settings.encryption.isEnabled = true;
            p.settings.encryption.checkword = encPost.settings.encryption.checkword;
            p.body = encPost.body;
            p.save(function(err) {
                if (err) {
                    a.status = "Problem";
                    a.message = "A problem occured when saving encrypted post to the database. Please try again.";
                    res.send(a);
                }
                else {
                    //encrypt replies
                    if (encPost.replies.length > 0) {
                        for (var i = 0; i < encPost.replies.length; i++) {
                            reply.update({
                                    _id: encPost.replies[i]._id
                                }, {
                                    $set: { text: encPost.replies[i].text }
                                },
                                function(err) {
                                    if (err) {
                                        a.status = "Problem";
                                        a.message = "A problem occured when saving encrypted post to the database. Please try again.";
                                        res.send(a);
                                    }
                                });

                            for (var j = 0; j < encPost.replies[i].rreplies.length; j++) {
                                reply.update({
                                        _id: encPost.replies[i].rreplies[j]._id
                                    }, {
                                        $set: { text: encPost.replies[i].rreplies[j].text }
                                    },
                                    function(err) {
                                        if (err) {
                                            a.status = "Problem";
                                            a.message = "A problem occured when saving encrypted post to the database. Please try again.";
                                            res.send(a);
                                        }
                                    });
                            }
                        }
                    }

                    a.status = "Completed";
                    a.message = "The post has been encrypted.";
                    res.send(a);
                }
            });


        }
    });
};

exports.removeEncryption = function(req, res) {
    var pId = req.params.id;
    var encPost = req.body;
    
    //find the post
    var a = {};
    post.findOne({ _id: pId }).exec(function(err, p) {
        if (!p || err) {
            a.status = "Problem";
            a.message = "Requested post has been not found!";
            res.send(a);
        }
        //check users authorisation
        else if (p.settings.author.toString() != req.user.id) {
            a.status = "Problem";
            a.message = "You are not authorized to change settings of this post.";
            res.send(a);
        }
        else {
            p.settings.encryption.isEnabled = false;
            p.settings.encryption.checkword = null;
            //decrypt the post body with all the updates
            p.body = encPost.body;
            p.save(function(err) {
                if (err) {
                    a.status = "Problem";
                    a.message = "A problem occured when saving encrypted post to the database. Please try again.";
                    res.send(a);
                }
                else {
                    //decrypt replies
                    if (encPost.replies.length > 0) {
                        for (var i = 0; i < encPost.replies.length; i++) {
                            reply.update({
                                    _id: encPost.replies[i]._id
                                }, {
                                    $set: { text: encPost.replies[i].text }
                                },
                                function(err) {
                                    if (err) {
                                        a.status = "Problem";
                                        a.message = "A problem occured when saving encrypted post to the database. Please try again.";
                                        res.send(a);
                                    }
                                });
                            //decrypt reply's replies
                            for (var j = 0; j < encPost.replies[i].rreplies.length; j++) {
                                reply.update({
                                        _id: encPost.replies[i].rreplies[j]._id
                                    }, {
                                        $set: { text: encPost.replies[i].rreplies[j].text }
                                    },
                                    function(err) {
                                        if (err) {
                                            a.status = "Problem";
                                            a.message = "A problem occured when saving encrypted post to the database. Please try again.";
                                            res.send(a);
                                        }
                                    });
                            }
                        }
                    }

                    a.status = "Completed";
                    a.message = "An encrypted has been removed from the post.";
                    res.send(a);
                }
            });


        }
    });
    
};

exports.myPosts = function(req,res) {
    console.log(req.user._id);
    post.find({ 'settings.author': req.user._id})
    .populate('settings.category')
    .select('-body')
    .exec(function(err, p) {
        if(err) {
            throw(err);
        } else {
            res.send(p);
        }
    });
};

function filterPosts(postsArray, user) {
    var out = [];
    out = postsArray;
    //check each post
    for (var i = 0; i < postsArray.length; i++) {
        var isMember = false;
        //if posts privacy is closed group - hidden
        if (postsArray[i].settings.privacy == "cgh") {
            out[i].settings.isAdmin = false;
            if (user) {
                for (var k = 0; k < postsArray[i].settings.access.allowed.length; k++) {
                    if (postsArray[i].settings.access.allowed[k].toString() == user._id) {
                        isMember = true;
                    }
                }
            }
            out[i].settings.access = null;
            if (!isMember) {
                out.splice(i, 1);
            }
        }
    }
    for (var j = 0; j < out.length; j++) {
        out[j].settings.access = null;
    }
    return out;
}
