const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require('./schema');
const Review = require('./models/review');
// country-list exposes helper functions - use getNames() to get an array
const { getNames, getCodes } = require('country-list');

const app = express(); 

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400);
    }else{
        next();
    }
}

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.details.map(el => el.message).join(', '));
    }else{
        next();
    }
}

app.get('/', (req, res) => { 
    res.send('Home Page');
});

// Add New Listing Form Route
app.get('/listings/new', (req, res) => {
    try {
        // getNames() returns an array of country names
        const raw = getNames();                    // e.g. ["Bahamas (the)", "Dominican Republic (the)", ...]
        const countries = raw.slice().sort()
        .map(name => name.replace(/\s*\(the\)$/, '')); // removes " (the)"
        res.render('listings/new.ejs', { countries });
    }
    catch (err) { 
        console.log(err);
        res.send(err);
    }
});

// Show Route
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    // populate reviews so the template can access review fields
    const listing = await Listing.findById(id).populate('reviews');
    if(!listing) return next(new ExpressError(404, 'Listing not found'));
    res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
//   const newListing = new Listing(req.body.listing);
  listingSchema.validateAsync(req.body);
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  const raw = getNames();                    // e.g. ["Bahamas (the)", "Dominican Republic (the)", ...]
  const countries = raw.slice().sort()
  .map(name => name.replace(/\s*\(the\)$/, ''));
  res.render("listings/edit.ejs", { listing, countries });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

// Review Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if(!listing) return next(new ExpressError(404, 'Listing not found'));
    let newReview = new Review(req.body.review);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
})); 

// Review Delete Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

main().then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/travelhub');
}

app.get('/listings', wrapAsync(async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.render("listings/index.ejs", { listings });
    } catch (err) {
        res.status(500).send(err);
    }
}));

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404,"Page Not Found")); 
// });

app.use((err, req, res, next) => {
   let { statusCode = 500, message="Something went wrong" } = err;
   res.render("listings/error.ejs", { message, statusCode });
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});