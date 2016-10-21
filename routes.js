var Model = require(__dirname + '/models'),
    Mongoose = require('mongoose'),
    Moment = require('moment'),
    markdown = require('markdown').markdown,
    pwd = require('password-hash'),
    sanitize = require('sanitize-html');
    


function renderPosts(req, res, query, showHome){
    Model.Post.find(query, function(err, posts){
        res.render('index', {
            posts: posts,
            loggedIn: req.session.user_id != null,
            showActions: true,
            showHome: showHome,
            helpers: {
                createTitleLink: function(title){
                    var ta = title.replace(/\s/g, '-');
                    return ta;
                },
                toUpperCase: function(title){
                    title = title.replace(/(\b[a-z](?!\s))/g, function(x){ return x.toUpperCase(); });
                    return title;
                },
                formatDate: function(date){
                    var str = Moment(date).format("MMMM Do YYYY");
                    return str;
                },
                formatPost: function(post){
                    return markdown.toHTML(post);
                },
                ownsPost: function(creator, options){
                    if(req.session.user_id == creator){
                        return options.fn(this);
                    }
                    return '';
                }
            }
        });
    }).sort({date: -1});
}
module.exports = {
    index: function(req, res){
        renderPosts(req, res, {});
    },
    admin: function(req, res){
        res.render('admin', {showHome: true});
    },
    addPost: function(req, res){
        var post = req.body;
        if(post.title.trim().length <= 0 && post.body.trim().length <= 0){
            res.redirect('/admin');
            return;
        }
        
        var postObject = {
            title: sanitize(post.title.toLowerCase()),
            body: sanitize(post.body),
            creator: req.session.user_id
        }

        if(post.id == null){
            var p = new Model.Post(postObject);
            p.save();
        }else{

            Model.Post.findOne({_id: Mongoose.Types.ObjectId(post.id)}, function(err, p){
               if(!err && p != null){
                p.title = sanitize(post.title.toLowerCase());
                p.body = sanitize(post.body);
                
                p.save();
               }else{
                   console.log("Couldn't find post");
               }
            });
        }
        
        res.redirect('/');
    },
    removePost: function(req, res){
        console.log(req.params.postid);
        Model.Post.findOne({_id: req.params.postid}, function(err, post){
            if(!err && post != null){
                if(post.creator == req.session.user_id){
                    post.remove();
                    res.redirect('/');
                }
            }
        });
    },
    editPost: function(req, res){
        Model.Post.findOne({_id: req.params.postid}, function(err, post){
            if(!err && post != null){
                res.render('admin', {
                    title: post.title,
                    body: post.body,
                    id: post._id
                });
            }else{
                res.redirect('/admin');
            }
        });
    },
    getPostByName: function(req, res){
        var name = req.params.posttitle.replace('-', ' ');
        renderPosts(req, res, {title: name}, true);
    },
    searchPostsByName: function(req, res){
        var name = req.params.query.replace('-', ' ');
        renderPosts(req, res, {$text: {$search: name}});
    },
    getUserPosts: function(req, res){
        Model.User.findOne({name: req.params.username}, function(err, user){
            if(!err && user){
                renderPosts(req, res, {creator: user._id});
            }else{
                res.redirect('/');
            }
        });
    },
    login: function(req, res){
        var post = req.body;
        if(typeof post.user !== "string"){
            res.redirect('/admin');
        }else{
            Model.User.findOne({name: post.user}, function(err, user){
                if(!err && user != null){
                    if(pwd.verify(post.password, user.password)){
                        req.session.user_id = user._id;
                    }
                }
                res.redirect('/admin');
            });
        }
    },
    logout: function(req, res){
        req.session.user_id = null;
        res.redirect('/');
    }
}