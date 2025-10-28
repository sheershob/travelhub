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
const session = require('express-session');
// country-list exposes helper functions - use getNames() to get an array
const { getNames, getCodes } = require('country-list');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRouter = require('./routes/user');

const app = express(); 

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const validateListing = (req, res, next) => {
    // Accept either nested (req.body.listing) or top-level fields (req.body)
    const payload = req.body && req.body.listing ? { listing: req.body.listing } : { listing: req.body };
    const { error, value } = listingSchema.validate(payload);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        return next(new ExpressError(400, msg));
    }
    // attach the validated and normalized listing object for use in routes
    req.validatedListing = value.listing;
    next();
}

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

const sessionOptions = {
    secret: "secretcode123",
    resave: false,
    saveUninitialized: true,
    cookie:{
        // expires must be a Date
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 4), // 4 weeks
        maxAge: 1000 * 60 * 60 * 24 * 7 * 4,
        httpOnly: true,
    }
};

app.get('/', (req, res) => { 
    res.send('Home Page');
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    // res.locals.error = req.flash('error');
    next();
});

app.get('/register', (req, res) => {
    res.render('users/register.ejs');
});

app.use("/", userRouter);

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
  // use the validated listing object
  const newListing = new Listing(req.validatedListing);
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  const raw = getNames();                    // e.g. ["Bahamas (the)", ...]
  const countries = raw.slice().sort()
  .map(name => name.replace(/\s*\(the\)$/, ''));
  res.render("listings/edit.ejs", { listing, countries });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.validatedListing });
  req.flash('success', 'Successfully updated the listing!');
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash('success', 'Successfully deleted the listing!');
  res.redirect("/listings");
}));

// Review Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res, next) => {
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
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
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