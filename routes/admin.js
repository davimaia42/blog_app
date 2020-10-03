const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categorie');
const Categorie = mongoose.model("categories");
require('../models/Post')
const Post = mongoose.model("posts");
const {isAdmin} = require('../helpers/isAdmin');

router.get('/', isAdmin, (req, res)=>{
    res.render('admin/index');
});

router.get('/categories', isAdmin, (req, res)=>{
    Categorie.find().sort({date: 'desc'}).lean().then((categories)=>{
        res.render('admin/categories', {categories: categories});    
    }).catch((err)=>{
        req.flash("error_msg", "Error has occured while listing categories");
        res.redirect('/admin');
    });
});

router.get('/categories/add', isAdmin, (req, res)=>{
    res.render('admin/addcategorie');
});

router.post('/categories/new', isAdmin, (req, res)=>{
    var errors = [];
    
    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: 'Invalid name'});
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: 'Invalid slug'});
    }
    if(errors.length > 0){
        res.render("admin/addcategorie.handlebars", {errors: errors});
    } else{
        const newCategorie = {
            name: req.body.name,
            slug: req.body.slug
        }
        new Categorie(newCategorie).save().then(()=>{
            req.flash('success_msg', 'categorie added');
            console.log('categoria adicionada');
            res.redirect('/admin/categories');
        }).catch((err)=>{
            req.flash('error_msg', 'An error has occured, try again');
            console.log(err);
        });
    }
});

router.get('/categories/edit/:id', isAdmin, (req, res)=>{
    Categorie.findOne({_id: req.params.id}).lean().then((categorie)=>{
        res.render('admin/editcategorie', {categorie: categorie});
    }).catch((err)=>{
        req.flash("error_msg", "This categorie does not exist");
        res.redirect("/admin/categories");
    });
});

router.post("/categories/edit", isAdmin, (req, res)=>{
    Categorie.findOne({_id: req.body.id}).then((categorie)=>{
        categorie.name = req.body.name;
        categorie.slug = req.body.slug;

        categorie.save().then(()=>{
            req.flash("success_msg", "Edited successfully");
            res.redirect("/admin/categories");
        }).catch((err)=>{
            req.flash("error_msg", "Error saving new version of category");
            res.redirect("/admin/categories");
        });
    }).catch((err)=>{
        req.flash("error_msg", "Error while editing categorie");
        res.redirect("/admin/categories");
    })
});
router.post("/categories/delete", isAdmin, (req, res)=>{
    Categorie.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categorie deleted");
        res.redirect("/admin/categories");
    }).catch((err)=>{
        req.flash("error_msg", "Error deleting categorie");
        res.redirect("/admin/categories");
    })
});

router.get("/posts", isAdmin, (req, res)=>{
    Post.find().populate("categorie").lean().then((posts)=>{
        res.render("admin/posts", {posts: posts});
    }).catch((err)=>{
        req.flash("error_msg", "error listing posts");
        res.redirect("/admin");
    });
});

router.get("/posts/add", isAdmin, (req, res)=>{
    Categorie.find().lean().then((categories)=>{
        res.render("admin/addpost", {categories: categories});
    }).catch((err)=>{
        req.flash("error_msg", "Error loading form");
        res.redirect("/admin/posts");
    });
});

router.post("/posts/add", isAdmin, (req, res)=>{
    var errors = [];
    if(req.body.categorie == 0){
        errors.push({text: "add a category"});
    }
    if(errors.length > 0){
        res.render("admin/addpost", {errors: errors});
    } else{
        const newPost = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            slug: req.body.slug,
            categorie: req.body.categorie
        }
        new Post(newPost).save().then(()=>{
            req.flash('success_msg', 'Post created');
            res.redirect('/admin/posts');
        }).catch((err)=>{
            req.flash('error_msg', 'error creating post');
            res.redirect("/admin/posts");
        });
    }
});

router.get("/posts/edit/:id", isAdmin, (req, res)=>{
   Post.findOne({_id: req.params.id}).lean().then((post)=>{
    Categorie.find().lean().then((categories)=>{
        res.render("admin/editpost", {post: post, categories: categories});
    })
   })
});

router.post("/posts/edit", isAdmin, (req, res)=>{
    Post.findOne({_id: req.body.id}).then((post)=>{
        post.title = req.body.title;
        post.slug = req.body.slug;
        post.description = req.body.description;
        post.content = req.body.content;
        post.categorie = req.body.categorie;
        post.save().then(()=>{
            req.flash("sucess_msg", "Post edited")
            res.redirect("/admin/posts")
        })
    }).catch((err)=>{
        req.flash("error_msg", "error editing post")
    });
});

router.get("/posts/delete/:id", isAdmin, (req, res)=>{
    Post.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Post deleted");
        res.redirect("/admin/posts");
    }).catch((err)=>{
        req.flash("error_msg", "error deleting post");
        res.redirect("/admin/posts");
    });
})
module.exports = router;