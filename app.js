if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// console.log(process.env);

const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require('./schema');
const Review = require('./models/review');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');
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
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

app.get('/register', (req, res) => {
    res.render('users/register.ejs');
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// Connect to MongoDB and start the server. Use sensible timeouts so failures are
// surfaced quickly instead of silently buffering operations.
async function startServer() {
    const uri = 'mongodb://127.0.0.1:27017/travelhub';
    try {
        await mongoose.connect(uri, {
            // modern connection options
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // fail fast if server can't be selected
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        mongoose.connection.on('error', err => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('Mongoose disconnected');
        });

        // start listening only after DB is available
        app.listen(8080, () => {
            console.log('Server is running on port 8080');
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        // Exit the process - application cannot function without DB
        process.exit(1);
    }
}

startServer();

// app.get('/listings', wrapAsync(async (req, res) => {
//     try {
//         const listings = await Listing.find({});
//         res.render("listings/index.ejs", { listings });
//     } catch (err) {
//         res.status(500).send(err);
//     }
// }));

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404,"Page Not Found")); 
// });

app.use((err, req, res, next) => {
   let { statusCode = 500, message="Something went wrong" } = err;
   res.render("listings/error.ejs", { message, statusCode });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});