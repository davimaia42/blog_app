const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/User");
const User = mongoose.model("users");
const bcrypt = require('bcryptjs');
const passport = require("passport");

router.get('/sign-in', (req, res)=>{
    res.render('user/signin');
});

router.post('/sign-in', (req, res)=>{
    var errors = [];
    
    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Invalid name"});
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({text: "Invalid email"});
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        errors.push({text: "Invalid password"});
    }
    if(req.body.password.length < 6){
        errors.push({text: "Password too short"});
    }
    if(req.body.password != req.body.password2){
        errors.push({text: "Passwords don't match"});
    }
    if(errors.length > 0){
        res.render('user/signin', {errors: errors});
    } else{
        User.findOne({email: req.body.email}).then((user)=>{
            if(user){
                req.flash('error_msg', 'Email address is already in use');
                res.redirect('/user/sign-in');
            } else{
                const newUser = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                };
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err){
                            req.flash("error_msg", "Internal error");
                            res.redirect("/");
                        }
                        else{
                            newUser.password = hash;

                            new User(newUser).save().then(()=>{
                                req.flash("success_msg", "User created successsfully");
                                res.redirect("/");
                            }).catch((err)=>{
                                req.flash("error_msg", "Error creating account, try again");
                                res.redirect('/user/sign-in');
                            });
                        }
                    })
                })
            }
        }).catch((err)=>{
            req.flash("error_msg", "Internal error");
            res.redirect('/');
        });
    }
});

router.get('/login', (req, res)=>{
    res.render('user/login');
});

router.post("/login", (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next)
});

router.get('/logout', (req, res)=>{
    req.logout();
    req.flash("success_msg", "account logout");
    res.redirect('/');
})
module.exports = router;