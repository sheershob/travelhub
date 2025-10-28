const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
    let { username, email, password } = req.body;
    let user = new User({ username, email });
    
});

module.exports = router;