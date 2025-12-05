const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl, isLoggedIn} = require('../middleware');

const userController = require('../controllers/user');
 
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync( userController.signup));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Use a custom callback so we can log auth errors and control flow.
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

// Google OAuth Routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (!req.user.isUsernameSet) {
      return res.redirect('/choose-username');
    }
    res.redirect('/listings');
  }
);

router.get('/choose-username', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  if (req.user.isUsernameSet) return res.redirect('/listings');
  res.render('users/chooseUsername'); // make this view
});

router.post('/choose-username', async (req, res, next) => {
  try {
    const { username } = req.body;

    // Check if username already exists
    const existing = await User.findOne({ username });
    if (existing) {
      req.flash('error', 'Username already taken!');
      return res.redirect('/choose-username');
    }

    // Update the Google user’s record
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, isUsernameSet: true },
      { new: true }
    );

    // Log the user in immediately after setting username
    req.logIn(updatedUser, (err) => {
      if (err) {
        console.error('Login error:', err);
        req.flash('error', 'Login after signup failed. Please log in.');
        return res.redirect('/login');
      }

      req.flash('success', 'Welcome to Travel Hub!');
      return res.redirect('/listings');
    });

  } catch (err) {
    console.error('Error in choose-username route:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/choose-username');
  }
});

router.post("/listings/:id/book", isLoggedIn, wrapAsync( userController.bookListing ));

module.exports = router;