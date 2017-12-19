var mongoose = require('mongoose');

var child = {
    name: String,
    id: String
}
// define the schema for our user model
var categorySchema = mongoose.Schema({
    name: String,
    categoriesId: [child],
    postsId: [String],
    parent: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Category', categorySchema);