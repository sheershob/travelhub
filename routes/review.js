const express = require('express');
// mergeParams true so this router can access :id from parent route (listings/:id/reviews)
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema');
const { isLoggedIn, isReviewAuthor } = require('../middleware');

const reviewController = require('../controllers/review');

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
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Review Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;