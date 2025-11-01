const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl} = require('../middleware');

const userController = require('../controllers/user');
 
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync( userController.signup));

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

router.get("/logout", userController.logout);

module.exports = router;