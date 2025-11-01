const Review = require('./models/review');

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

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review){
        req.flash('error', 'Review not found');
        return res.redirect(`/listings/${req.params.id}`);
    }
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to delete this review!');
        return res.redirect(`/listings/${req.params.id}`);
    }
    next();
}