const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const {isLoggedIn} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage });

const listingController = require('../controllers/listing');

// Index Route - show all listings
router.get("/", wrapAsync( listingController.index));

// New Route
router.get("/new", isLoggedIn, listingController.new );

// Show Route
router.get("/:id", wrapAsync( listingController.showListing));

// Create Route
router.post("/", isLoggedIn, upload.single('image'), wrapAsync( listingController.createListing ));

// router.post("/", isLoggedIn, upload.single('image'), (req, res) => {
//   console.log('body:', req.body);
//   console.log('file:', req.file);
//   res.send('ok');
// });

//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync( listingController.edit));

// Update Route
router.put("/:id", isLoggedIn, upload.single('image'), wrapAsync( listingController.updateListing ));

// Delete Route
router.delete("/:id", isLoggedIn, wrapAsync( listingController.deleteListing));

module.exports = router;