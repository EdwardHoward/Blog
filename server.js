var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    handlebars = require('express-handlebars'),
    Route = require(__dirname+'/routes');
    

var config;

try{
    config = require(__dirname + '/config');
}catch(err){
    config = {};
    console.log("Couldn't find /config.js file");
    console.log("See example-config.js");
}

mongoose.connect(config.mongoAddress);


app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: config.sessionSecret
}));

app.engine('hbs', handlebars({defaultLayout: 'main', extname:'.hbs'}));
app.set('view engine', 'hbs');

app.use('/static', express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(config.port, config.ip, 0, function(err){
    if(err) console.log(err);
    console.log("Server listening on port " + config.port);
});

app.get('/', Route.index);

app.get('/admin', checkAuth, Route.admin);

// Get all posts for a user
app.get('/posts/user/:username', Route.getUserPosts);

// Get post based on title
app.get('/posts/:posttitle', Route.getPostByName);

// Search posts by title
app.get('/posts/search/:query', Route.searchPostsByName);

// Add/remove posts
app.post('/posts', checkAuth, Route.addPost);
app.get('/posts/remove/:postid', checkAuth, Route.removePost);
app.get('/posts/edit/:postid', checkAuth, Route.editPost);

// login/logout
app.post('/login', Route.login);
app.get('/logout', Route.logout);

app.use(function(req, res, next){
    res.status(404);
    res.render('404', {url: req.url});
    
    return;
})

function checkAuth(req, res, next){
    if(!req.session.user_id){
        res.render('login', {showHome: true});
    }else{
        next();
    }
}