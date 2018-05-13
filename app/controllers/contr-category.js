var category = require('../models/category.js');
var mongoose = require('mongoose');
var parentCategories = [];

exports.addCategoty = function(req, res) {

    //check if category already exsists
    var alreadyExist = false;
    if (req.body.category == "" || req.body.category == null) {
        res.setHeader("Content-Type", "text/html");
        res.status(406);
        res.send("Missing element.");
    }
    else {
        //check if user is admin
        if (req.user.local.role == "admin") {
            //get the parent category
            category.findOne({ '_id': req.body.parent }).populate('categoriesId').exec(function(err, doc) {
                if (!doc || err) {
                    res.setHeader("Content-Type", "text/html");
                    res.status(406);
                    res.send("Wrong parrent category");
                }
                else {
                    //Check if category already exists
                    for (var i = 0; i < doc.categoriesId.length; i++) {
                        if (doc.categoriesId[i].name == req.body.category) {
                            alreadyExist = true;
                        }
                    }
                    if (alreadyExist) {
                        res.setHeader("Content-Type", "text/html");
                        res.status(406);
                        res.send("Category with this mane already exists");
                    }
                    else {
                        var n = new category();
                        n.name = req.body.category;
                        n.categoriesId = [];
                        n.postsId + [];
                        n.parent = mongoose.Types.ObjectId(req.body.parent);
                        n.save(function(err, newCategory) {
                            doc.categoriesId.push(mongoose.Types.ObjectId(newCategory._id));
                            doc.save();
                            res.setHeader("Content-Type", "text/html");
                            res.status(200);
                            res.send("Item has been added successfuly.");
                        });
                    }
                }
            });
        }
        else {
            res.setHeader("Content-Type", "text/html");
            res.status(406);
            res.send("You are not authorised to add categories");
        }

    }
};

function getparentQuery(cat, res, req) {
    var promise = category.findOne({ _id: cat.parent }).exec();
    promise.then(function(parentCat) {
        parentCategories.push(parentCat);
        if (parentCat.parent != null) {
            getparentQuery(parentCat, res);
        }
        else {
            res.send(parentCategories);
        }
    });
}

exports.getParents = function(req, res) {
    parentCategories = [];
    var requestedCategoryId = req.params.id;
    if (mongoose.Types.ObjectId.isValid(requestedCategoryId)) {
        category.findOne({ '_id': requestedCategoryId })
            .populate('categoriesId')
            .exec(function(err, result) {
                if (err || !result) {
                    res.status(406).end();
                }
                else {
                    if (result.parent == null) {
                        parentCategories.push(result);
                        res.send(parentCategories);
                    }
                    else {
                        parentCategories.push(result);
                        getparentQuery(result, res, req);
                    }
                }
            });
    }
    else {
        res.status(406).end();
    }
};

exports.removeCategory = function(req, res) {
    //getting ID from request
    var requestedCategoryId = req.params.id;

    //finding category in DB
    var query = category.findOne();
    query.where({ _id: requestedCategoryId })
        .exec(function(err, result) {
            if (err) { console.log("Error: " + err); }
            else if (result == undefined || result == null) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("Category which you are trying to delete doesnt't exist.");
            }
            else if (result.postsId.length != 0) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("It is not possible to remove this category. There are posts under this category.");
            }
            else {
                //check if no other categories are attached
                if (result.categoriesId.length != 0) {
                    res.setHeader("Content-Type", "text/html");
                    res.status(406);
                    res.send("It is not possible to remove this category. There are other categories attached to it.");
                }
                else {
                    //remove category starts here

                    var qid = result.parent;
                    var id = mongoose.Types.ObjectId(qid);
                    //search conditions
                    var conditions = { _id: id };
                    //edit conditions
                    var update = { $pull: { categoriesId: mongoose.Types.ObjectId(requestedCategoryId) } };
                    //edit options
                    var options = { multi: true };
                    //Execute query
                    category.update(conditions, update, options, function(err) {
                        if (err) {
                            console.log("Error when removing from parrent:" + err);
                        }
                    });

                    var condition = { _id: requestedCategoryId };
                    category.remove(condition, function(err) {
                        if (err) {
                            console.log("Error when removing requested item: " + err);
                        }
                    });

                    res.setHeader("Content-Type", "text/html");
                    res.status(200);
                    res.send("Item has been removed successfuly.");
                }
            }
        });

};
