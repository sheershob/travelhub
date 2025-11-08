const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require('../utils/ExpressError');

module.exports.createReview = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new ExpressError(404, 'Listing not found'));
  const newReview = new Review(req.validatedReview);
  newReview.author = req.user._id;
  await newReview.save();
  // Atomically push review id and increment ratings sum/count
  const updated = await Listing.findByIdAndUpdate(req.params.id, {
    $push: { reviews: newReview._id },
    $inc: { 'ratings.sum': newReview.rating, 'ratings.count': 1 }
  }, { new: true });
  // Recompute average and persist
  if (updated && typeof updated.ratings.sum === 'number' && typeof updated.ratings.count === 'number' && updated.ratings.count > 0) {
    const avg = Number((updated.ratings.sum / updated.ratings.count).toFixed(2));
    await Listing.findByIdAndUpdate(req.params.id, { $set: { 'ratings.average': avg } });
  }
  req.flash('success', 'Successfully added your review!');
  res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    // Find the review to get its rating
    const review = await Review.findById(reviewId);
    if (review) {
      // Atomically remove review reference and decrement sum/count
      const updated = await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
        $inc: { 'ratings.sum': -review.rating, 'ratings.count': -1 }
      }, { new: true });
      // Recompute average safely
      if (updated) {
        if (updated.ratings.count <= 0) {
          // Reset to defaults
          await Listing.findByIdAndUpdate(id, { $set: { 'ratings.count': 0, 'ratings.sum': 0, 'ratings.average': null } });
        } else {
          const avg = Number((updated.ratings.sum / updated.ratings.count).toFixed(2));
          await Listing.findByIdAndUpdate(id, { $set: { 'ratings.average': avg } });
        }
      }
    }
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/listings/${id}`);
}