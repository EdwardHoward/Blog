var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = mongoose.model('User', {
    name: String,
    date: {type: Date, default: Date.now },
    password: String,
    salt: String
});

var Post = mongoose.model('Post', {
    title: String,
    path: String,
    body: String,
    date: {type: Date, default: Date.now },
    creator: Schema.Types.ObjectId
});

module.exports = {
    User: User,
    Post: Post
}