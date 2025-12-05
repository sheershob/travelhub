const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');

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

module.exports.bookListing = async (req, res) => {
  const { dates, totalPrice } = req.body;

  // ✅ HARD SAFETY CHECK
  if (!dates || !totalPrice) {
    req.flash("error", "Please select valid dates before booking.");
    return res.redirect(`/listings/${req.params.id}`);
  }

  const [checkIn, checkOut] = dates.split(" to ");

  const booking = await Booking.create({
    user: req.user._id,
    listing: req.params.id,
    checkIn,
    checkOut,
    totalPrice
  });

  const listing = await Listing.findById(req.params.id);
  listing.bookings.push(booking._id);
  await listing.save();

  const user = await User.findById(req.user._id);
  user.bookings.push(booking._id);
  await user.save();

    console.log(booking);
    req.flash("success", "Booking successful!");
    res.redirect(`/listings/${listing._id}`);
}