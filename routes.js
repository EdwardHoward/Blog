var Model = require(__dirname + '/models'),
    Moment = require('moment'),
    markdown = require('markdown').markdown,
    pwd = require('password-hash');
    
module.exports = {
    index: function(req, res){
        Model.Post.find({$query: {}, $orderby: {date: -1}}, function(err, posts){
            res.render('index', {
                posts: posts,
                helpers:{
                    formatDate: function(date){
                        var str = Moment(date).format("MMMM Do YYYY");
                        return str;
                    },
                    formatPost: function(post){
                        return markdown.toHTML(post);
                    },
                    ownsPost: function(creator, postId){
                        if(req.session.user_id == creator){
                            return '<div class="options"><a href="/removepost/'+postId+'">Remove</a></div>';
                        }
                        return '';
                    }
                }
            });
        });
        
    },
    admin: function(req, res){
        res.render('admin');
    },
    addPost: function(req, res){
        var post = req.body;
        Model.User.findOne({_id: req.session.user_id}, function(err, user){
            if(err){
                res.send(err);
                return;  
            } 
            var p = new Model.Post({
                title: post.title,
                body: post.body,
                creator: user._id
            });
            
            p.save();
            
            res.redirect('/');
        });
    },
    removePost: function(req, res){
        Model.Post.findOne({_id: req.params.postid}, function(err, post){
            if(!err && post != null){
                if(post.creator == req.session.user_id){
                    post.remove();
                    res.redirect('/');
                }
            }
        });
    },
    getUserPosts: function(req, res){
        Model.User.findOne({name: req.params.username}, function(err, user){
            Model.Post.find({creator: user._id}, function(err, posts){
                res.render('index', {
                    posts: posts,
                    helpers:{
                        formatDate: function(date){
                            var str = Moment(date).format("MMMM Do YYYY, h:mm a");
                            return str;
                        }
                    }
                });
            });
        });
    },
    login: function(req, res){
        var post = req.body;
        
        Model.User.findOne({name: post.user}, function(err, user){
            if(!err && user != null){
                if(pwd.verify(post.password, user.password)){
                    req.session.user_id = user._id;
                }
            }
            res.redirect('/admin');
        })
    },
    logout: function(req, res){
        req.session.user_id = null;
        res.redirect('/');
    }
}