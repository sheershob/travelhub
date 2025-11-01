const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const ListingSchema = require('../schema');
const {isLoggedIn} = require('../middleware');
const { getNames, getCodes } = require('country-list');

const listingController = require('../controllers/listing');

// Index Route - show all listings
router.get("/", wrapAsync( listingController.index));

// New Route
router.get("/new", isLoggedIn, listingController.new );

// Show Route
router.get("/:id", wrapAsync( listingController.showListing));

// Create Route
router.post("/", isLoggedIn, wrapAsync( listingController.createListing ));

//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync( listingController.edit));

// Update Route
router.put("/:id", isLoggedIn, wrapAsync( listingController.updateListing ));

// Delete Route
router.delete("/:id", isLoggedIn, wrapAsync( listingController.deleteListing));

module.exports = router;