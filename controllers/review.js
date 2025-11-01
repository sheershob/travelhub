const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new ExpressError(404, 'Listing not found'));
  const newReview = new Review(req.validatedReview);
  newReview.author = req.user._id;
  await newReview.save();
  listing.reviews.push(newReview);
  await listing.save();
  req.flash('success', 'Successfully added your review!');
  res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/listings/${id}`);
}