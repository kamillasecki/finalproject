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
