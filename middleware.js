module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){     // Not logged in
        req.session.redirectUrl = req.originalUrl; // Store the url they are requesting
        req.flash('error', 'You must be signed in to create a new listing!');
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}