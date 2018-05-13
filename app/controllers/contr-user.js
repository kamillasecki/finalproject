var user = require('../models/user.js');
var mongoose = require('mongoose');

//create new post
exports.getAllUsers = function(req, res) {
    user.find()
        .select("displayname")
        .exec(function(err, doc) {
            if (err) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("An error on connection to the database occured");
            }
            else if (!doc) {
                res.setHeader("Content-Type", "text/html");
                res.status(404);
                res.send("No users were found.");
            }
            else {
                res.status(200);
                console.log(doc);
                res.send(doc);
            }
        });
};

exports.changePass = function(req, res) {
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors[0].msg);
    }
    else {
        if (req.body.oldPass && req.body.newPass) {
            user.findOne({ _id: req.user._id })
                .exec(function(err, u) {
                    if (err) {
                        throw err;
                    }
                    else {
                        var oldPass = req.body.oldPass;
                        var newPass = req.body.newPass;
                        //validate current password
                        if (!u.validPassword(oldPass)) {
                            res.send("An old password seems to be incorrect.");
                        }
                        else {
                            //generate a hash of new password
                            u.local.password = u.generateHash(newPass);
                            u.save(function(err) {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    req.logout();
                                    res.send("Your password has been updated.");
                                }
                            });
                        }
                    }
                });
        }
        else {
            res.send("You have to provide new and old password!");
        }
    }


};

exports.changeDisplayname = function(req, res) {
    if (req.body.name) {
        user.findOne({ _id: req.user._id })
            .exec(function(err, u) {
                if (err) {
                    res.send(err);
                }
                else {
                    var name = req.body.name;

                    user.findOne({ displayname: name })
                        .exec(function(err, u2) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                if (u2) {
                                    res.send("This display name is already taken. Please choose different one.");
                                }
                                else {
                                    u.displayname = name;
                                    u.save(function(err) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            res.send("Your displayname has been updated.");
                                        }
                                    });
                                }
                            }
                        });
                }
            });
    }
    else {
        res.send("New display name cannot be empty!");
    }
};
