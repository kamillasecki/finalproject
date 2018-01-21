var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var user = require('../models/user.js');

var child = {
    name: String,
    id: { type: Schema.Types.ObjectId, ref: 'Category' }
}
// define the schema for our user model
var categorySchema = mongoose.Schema({
    name: String,
    categoriesId: [child],
    postsId: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parent: { type: Schema.Types.ObjectId, ref: 'Category' }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Category', categorySchema);

var Category = mongoose.model('Category', categorySchema);