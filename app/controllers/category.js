var category = require('../models/category.js');
var mongoose = require('mongoose');
var parentCategories = [];

exports.addCategoty = function(req, res) {
    var categoryNmae = req.body.category;
    console.log('Trying to add category to: ' + req.body.parent)
    //check if category already exsists
    var alreadyExist = false;
    category.findOne({ '_id': req.body.parent }, function(err, doc) {
        console.log('Trying to add category to: ' + req)

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
                n.parent = req.body.parent;
                n.save(function(err, newCategory) {
                    console.log("Saved new category: " + newCategory._id);
                    doc.categoriesId.push({ name: req.body.category, id: newCategory._id });
                    doc.save();
                });
            }
        }
    });
};

exports.getCategoryPageById = function(req, res) {
    parentCategories = [];
    var requestedCategoryId = req.query.id;
    console.log("requestedCategoryId: " + requestedCategoryId);
    var query = category.findOne();
    query.where({ _id: requestedCategoryId })
        .exec(function(err, result) {
            if (err) { console.log("Error: " + err); }
            if (result == null || result == undefined || result == "") {
                console.log("No such a parent category exists");
                res.writeHead(302, {
                    'Location': '404'
                });
                res.end();
            }
            else {
                if (result.parent == '') {
                    parentCategories.push(result);
                    res.render('newCategory.ejs', { categories: parentCategories, message: '' });
                }
                else {
                    parentCategories.push(result);
                    getparentQuery(result, res, req);
                }
            }
        });
};

function getparentQuery(cat, res, req) {
    var promise = category.findOne({ _id: cat.parent }).exec();
    promise.then(function(parentCat) {
        parentCategories.push(parentCat);
        if (parentCat.parent != '') {
            getparentQuery(parentCat, res);
        }
        else {
            console.log(parentCategories);
            res.send(parentCategories);
            //res.render('newCategory.ejs', { categories: parentCategories, message: '' });
        }
    });
}

exports.getParents = function(req, res) {
    parentCategories = [];
    var requestedCategoryId = req.params.id;
    console.log("requestedCategoryId: " + requestedCategoryId);
    var query = category.findOne();
    query.where({ _id: requestedCategoryId })
        .exec(function(err, result) {
            if (err) { console.log("Error: " + err); }
            if (result == null || result == undefined || result == "") {
                console.log("No such a parent category exists");
                res.writeHead(302, {
                    'Location': '404'
                });
                res.end();
            }
            else {
                if (result.parent == '') {
                    parentCategories.push(result);
                    console.log(parentCategories);
                    res.send(parentCategories);
                }
                else {
                    parentCategories.push(result);
                    getparentQuery(result, res, req);
                }
            }
        });
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
                    var conditions = {_id: id};
                    //edit conditions
                    var update = { $pull: { categoriesId: { id: requestedCategoryId } } };
                    //edit options
                    var options = { multi: true };
                    //Execute query
                    category.update(conditions, update, options, function(err) {
                        console.log("Error:"+ err);
                    });

                    var condition = { _id: requestedCategoryId };
                    category.remove(condition, function(err) {
                        if (err) {
                            console.log("Error: " + err);
                        }
                    });



                    console.log("Parent: " + result);



                }
            }
        });

};
