//Modules
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');

    const app = express();
    const admin = require('./routes/admin');
    const userRouter = require('./routes/user');
    const mongoose = require('mongoose');

    require('./models/Post')
    const Post = mongoose.model("posts");
    require("./models/Categorie")
    const Categorie = mongoose.model("categories");
    const passport = require('passport');
    require("./config/auth")(passport);
    const db = require('./config/db');
//Config
    //Session
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    //Middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.user = req.user || null;
            next();
        });
    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    //Mongoose
        mongoose.connect("mongodb+srv://root:455465@blogapp-ff3r6.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
            console.log('database connected');
        }).catch((err)=>{
            console.log(err);
        });
    //Public
        app.use(express.static(path.join(__dirname, 'public')));
        app.use((req, res, next)=>{
            console.log("Wild middleware appeared");
            next();
        });
        
//Routes
    //Home
    app.get('/', (req, res)=>{
        Post.find().populate('categorie').sort({date: 'desc'}).lean().then((posts)=>{
            res.render("index", {posts: posts});
        }).catch((err)=>{
            req.flash("error_msg", "Error loading posts");
            res.redirect("/404");
        })
        
    });
    app.get('/post/:slug', (req, res)=>{
        Post.findOne({slug: req.params.slug}).lean().then((post)=>{
            if(post){
                res.render("post/index", {post: post});
            } else{
                req.flash("error_msg", "Post not found");
                res.redirect('/');
            }
        }).catch((err)=>{
            req.flash("error_msg", "Internal error");
            res.redirect('/');
        });
    });
    app.get("/404", (req, res)=>{
        res.send("Error 404 Not Found");
    })
    app.get('/categories', (req,res)=>{
        Categorie.find().lean().then((categories)=>{
            res.render('categories/index', {categories: categories});
        }).catch((err)=>{
            req.flash("error_msg", "Internal error listing categories");
            res.redirect('/');
        });
    });

    app.get('/categories/:slug', (req, res)=>{
        Categorie.findOne({slug: req.params.slug}).lean().then((categorie)=>{
            if(categorie){
                Post.find({categorie: categorie._id}).lean().then((posts)=>{
                    res.render("categories/posts", {posts: posts, categorie: categorie});
                }).catch((err)=>{
                    req.flash("error_msg", "Internal error listing posts");
                    res.redirect("/categories");
                });
            } else{
                req.flash("error_msg", "Categorie not found");
                res.redirect("/categories");
            }
        }).catch((err)=>{
            req.flash("error_msg", "Internal error");
            res.redirect('/');
        });
    });
    //Admin
    app.use('/admin', admin);
    app.use('/user', userRouter);

//Others
const PORT = process.env.PORT || 8081;
app.listen(PORT, ()=>{
    console.log("Server running...");
});