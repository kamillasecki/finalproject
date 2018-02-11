var category = require('../models/category.js');
var mongoose = require('mongoose');
var parentCategories = [];

exports.addCategoty = function(req, res) {
    var categoryNmae = req.body.category;
    console.log('Trying to add category to: ' + req.body.parent)
    //check if category already exsists
    var alreadyExist = false;
    category.findOne({ '_id': req.body.parent }).populate('categoriesId').exec(function(err, doc) {

        if (err) { console.log('Error while trying to get category from database'); }
        if (doc == null || doc == undefined || doc == "") {
            console.log("No such a parent category exists")
            res.writeHead(302, {
                'Location': '404'
            });
            res.end();
        }
        else {
            var categories = doc.categoriesId;
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].name == req.body.category) {
                    alreadyExist = true;
                }
            }
            if (alreadyExist) {
                console.log("Category already exist");
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("Category already exist");
            }
            else {
                var n = new category();
                n.name = req.body.category;
                n.categoriesId = [];
                n.postsId + [];
                n.parent = mongoose.Types.ObjectId(req.body.parent);
                n.save(function(err, newCategory) {
                    console.log("Saved new category: " + newCategory._id);
                    doc.categoriesId.push(mongoose.Types.ObjectId(newCategory._id));
                    doc.save();
                });
                res.setHeader("Content-Type", "text/html");
                res.status(200);
                res.send("Item has been added successfuly.");
                console.log("Item has been added successfuly.");
            }
        }
    });
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
    console.log("requestedCategoryId2: " + requestedCategoryId);
    var query = category.findOne();
    var r = {};
    query.where({ _id: requestedCategoryId })
        .populate('categoriesId')
        .exec(function(err, result) {
            if (err || (result == null || result == undefined || result == "")) {
                console.log("Error when trying to access database: " + err);
                r.status = "NotFound"
                res.send(r)
            }
            else {
                if (result.parent == null) {
                    parentCategories.push(result);
                    console.log(parentCategories);
                    res.send(parentCategories);
                }
                else {
                    console.log("result: " + result);
                    parentCategories.push(result);
                    getparentQuery(result, res, req);
                }
            }
        });
    console.log("parentCategories: " + parentCategories);
};

exports.removeCategory = function(req, res) {
    //getting ID from request
    var requestedCategoryId = req.params.id;

    //finding category in DB
    var query = category.findOne();
    query.where({ _id: requestedCategoryId })
        .exec(function(err, result) {
            if (err) { console.log("Error: " + err); }
            //check if no posts are atttached
            if (result.postsId.length != 0) {
                res.setHeader("Content-Type", "text/html");
                res.status(406);
                res.send("It is not possible to remove this category. There are posts under this category.");
                console.log("It is not possible to remove this category. There are posts under this category.")
            }
            else {
                //check if no other categories are attached
                if (result.categoriesId.length != 0) {
                    res.setHeader("Content-Type", "text/html");
                    res.status(406);
                    res.send("It is not possible to remove this category. There are other categories attached to it.");
                    console.log("It is not possible to remove this category. There are other categories attached to it.")
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
                    console.log("Item has been removed successfuly.")
                }
            }
        });

};
