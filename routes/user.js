const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl} = require('../middleware');
 
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync( async (req, res) => {
    try{
        let { username, email, password } = req.body;
        let user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.logIn(registeredUser, (err) => {
            if (err) {
                console.error('Login error:', err);
                req.flash('error', 'Login after signup failed. Please log in.');
                return res.redirect('/login');
            }
            req.flash("success", "Welcome to Travel Hub!");
            res.redirect("/listings");
        });
    }    
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Use a custom callback so we can log auth errors and control flow
router.post("/login", saveRedirectUrl, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Auth error:', err);
            return next(err);
        }
        if (!user) {
            // authentication failed - log Passport info for debugging
            console.warn('Login failed:', info);
            req.flash('error', info && info.message ? info.message : 'Invalid username or password');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            req.flash('success', `Welcome back ${user.username}!`);
            return res.redirect(res.locals.redirectUrl || "/listings");
        });
    })(req, res, next);
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err){
           return next(err);
        }
        req.flash('success', "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;