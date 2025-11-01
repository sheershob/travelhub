const User = require('../models/user');

module.exports.signup = async (req, res) => {
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
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
           return next(err);
        }
        req.flash('success', "Logged out successfully!");
        res.redirect("/listings");
    });
}