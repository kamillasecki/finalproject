var post = require('../models/post.js');
var notification = require('../models/notification.js');

//create new post
exports.count = function(id) {
    notification.count({ owner: id }, function(err, c) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("C: " + c);
            return c;
        }
    });
};

exports.getByUser = function(req, res) {
    if (req.user._id == req.params.user) {
        notification.find({ owner: req.params.user })
            .populate('creator', 'displayname')
            .populate('post', 'header.subject')
            .exec(function(err, n) {
                if (!n || err) {
                    res.status(400).end();
                }
                else {
                    res.send(n);
                }
            });
    }
    else {
        console.log("INCORRECT USER");
        res.status(401).end();
    }
};

exports.allowPostAccess = function(req, res) {
    var nId = req.params.id;
    //get the initial notification
    notification.findOne({ _id: nId })
        .exec(function(err, n) {
            if (!n || err) {
                res.status(400).end();
            }
            else {
                //check if the person accepting is the owner of the requaes
                if (n.owner.toString() == req.user._id.toString()) {
                    //move user from requested to allowed array
                    var conditions = { _id: n.post };
                    var update = { $pull: { 'settings.access.requested': n.creator }, $push: { 'settings.access.allowed': n.creator } };
                    var options = { multi: true };
                    post.update(conditions, update, options, function(err) {
                        if (err) {
                            res.status(400).end();
                        }
                        else {
                            //create new notification which will be sent back to the requestor informing him that his request has been accepted
                            var n2 = new notification();
                            n2.owner = n.creator;
                            n2.creator = n.owner;
                            n2.post = n.post;
                            n2.type = 'requestAcc';
                            n2.save(function(err) {
                                if (err) {
                                    res.status(400).end();
                                }
                                else {
                                    n.remove(function(err) {
                                        if (err) {
                                            res.status(400).end();
                                        }
                                        else {
                                            //send respont to the browser
                                            res.send("User's request has been approved.");
                                        }
                                    });
                                }
                            });

                        }
                    });
                }
                else {
                    //user not allowed to perform operation on notification
                    res.status(401).end();
                }
            }
        });
};

exports.denyPostAccess = function(req, res) {
    var nId = req.params.id;
    //get the initial notification
    notification.findOne({ _id: nId })
        .exec(function(err, n) {
            if (!n || err) {
                res.status(400).end();
            }
            else if (n.owner.toString() == req.user._id.toString()) {
                //remove user from requested array
                var conditions = { _id: n.post };
                var update = { $pull: { 'settings.access.requested': n.creator } };
                var options = { multi: true };
                post.update(conditions, update, options, function(err) {
                    if (err) {
                        res.status(400).end();
                    }
                    else {
                        //create new notification which will be sent back to the requestor informing him that his request has been denied
                        var n2 = new notification();
                        n2.owner = n.creator;
                        n2.creator = n.owner;
                        n2.post = n.post;
                        n2.type = 'requestDen';
                        n2.save(function(err) {
                            if (err) {
                                res.status(400).end();
                            }
                            else {
                                n.remove(function(err) {
                                    if (err) {
                                        res.status(400).end();
                                    }
                                    else {
                                        //send respont to the browser
                                        res.send("User's request has been denied.");
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                //user not allowed to perform operation on notification
                res.status(401).end();
            }
        });
};

exports.read = function(req, res) {
    var id = req.params.id;
    notification.update({ _id: id }, { $set: { hasRead: true } }, function() {
        res.send("ok");
    });
};

exports.delete = function(req, res) {
    var id = req.params.id;
    //find the notification
    notification.findOne({ _id: id })
        .exec(function(err, n) {
            if (!n || err) {
                res.status(400).end();
            }
            //check if notification nebongs to user
            else if (n.owner.toString() == req.user._id.toString()) {
                //remove notification
                n.remove(function(err) {
                    if (err) {
                        res.status(400).end();
                    }
                    else {
                        res.send("Notification has been removed.");
                    }
                });
            }
        });


};
