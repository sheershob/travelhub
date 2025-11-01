const express = require('express');
// mergeParams true so this router can access :id from parent route (listings/:id/reviews)
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema');
const Review = require('../models/review');
const Listing = require('../models/listing');
const { isLoggedIn, isReviewAuthor } = require('../middleware');

const validateReview = (req, res, next) => {
  // coerce rating to Number if present (forms send strings)
  if (req.body && req.body.review && typeof req.body.review.rating === 'string') {
    req.body.review.rating = Number(req.body.review.rating);
  }
  const { error, value } = reviewSchema.validate({ review: req.body.review });
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    return next(new ExpressError(400, msg));
  }
  // attach validated review to req for handlers to use
  req.validatedReview = value.review;
  next();
};

// Review Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new ExpressError(404, 'Listing not found'));
  const newReview = new Review(req.validatedReview);
  newReview.author = req.user._id;
  await newReview.save();
  listing.reviews.push(newReview);
  await listing.save();
  req.flash('success', 'Successfully added your review!');
  res.redirect(`/listings/${listing._id}`);
}));

// Review Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/listings/${id}`);
}));

module.exports = router;