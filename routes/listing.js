const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const ListingSchema = require('../schema');
const {isLoggedIn} = require('../middleware');
const { getNames, getCodes } = require('country-list');

// Index Route - show all listings
router.get("/", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { listings: allListings });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => { 
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
router.get("/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing doesn't exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}));

// Create Route
router.post("/", isLoggedIn, wrapAsync( async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    const raw = getNames();                    // e.g. ["Bahamas (the)", ...]
    const countries = raw.slice().sort()
    .map(name => name.replace(/\s*\(the\)$/, ''));
    res.render("listings/edit.ejs", { listing, countries });
}));

// Update Route
router.put("/:id", isLoggedIn, wrapAsync( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
}));

module.exports = router;