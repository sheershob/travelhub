const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema');
const Review = require('../models/review');
const Listing = require('../models/listing');

const validateReview = (req, res, next) => {
  // coerce rating to Number if present (forms send strings)
  console.log('Before coercion:', req.body.review);
  if (req.body && req.body.review && typeof req.body.review.rating === 'string') {
    req.body.review.rating = Number(req.body.review.rating);
  }
  console.log('After coercion:', req.body.review);
  const { error } = reviewSchema.validate({ review: req.body.review });
  if (error) { 
    console.log('Review Validation error');
    const msg = error.details.map(el => el.message).join(', ');
    return next(new ExpressError(400, msg));
  }
  next();
};

// Review Post Route
router.post("/", validateReview, wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing) return next(new ExpressError(404, 'Listing not found'));
    const validated = await reviewSchema.validateAsync({ review: req.body.review });
    const newReview = new Review(validated.review);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
    req.flash('success', 'Successfully added your review!');
    res.redirect(`/listings/${listing._id}`);
})); 

// Review Delete Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/listings/${id}`);
}));

module.exports = router;