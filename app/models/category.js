var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var categorySchema = mongoose.Schema({
    name: String,
    categoriesId: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    postsId: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    parent: { type: Schema.Types.ObjectId, ref: 'Category' }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Category', categorySchema);