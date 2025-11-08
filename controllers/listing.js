const Listing = require('../models/listing');
const { getNames, getCodes } = require('country-list');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { listings: allListings });
}

module.exports.new = (req, res) => { 
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
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{
        path: "author",
    }, }).populate("owner");
    if(!listing){
        req.flash("error", "Listing doesn't exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    // Accept either nested `listing` payload (req.body.listing) or top-level fields (req.body)
    const payload = req.body && req.body.listing ? req.body.listing : req.body;
    const newListing = new Listing(payload);
    newListing.owner = req.user._id;
    const location = newListing.location; // from your form input

  // 1️⃣ Try exact location
  let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  let response = await fetch(url);
  let data = await response.json();

  let coords;

  if (data.length > 0) {
    coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } else {
    // 2️⃣ Fallback: use country
    let countryUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newListing.country)}&format=json&limit=1`;
    let countryResponse = await fetch(countryUrl);
    let countryData = await countryResponse.json();
    if (countryData.length > 0) {
      coords = { lat: parseFloat(countryData[0].lat), lon: parseFloat(countryData[0].lon) };
    } else {
      coords = null; // completely invalid input
    }
  }
    // console.log('Coordinates:', coords);
      if (coords) {
    newListing.geography = {
      type: "Point",
      coordinates: [coords.lon, coords.lat] // ✅ GeoJSON format
    };
  }
    // If a file was uploaded by multer (Cloudinary), attach the url/filename
    if (req.file) {
        console.log('New Listing', req);
        newListing.image = { url: req.file.path, filename: req.file.filename };
    } 
    await newListing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect("/listings");
}

module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    const raw = getNames();                    // e.g. ["Bahamas (the)", ...]
    const countries = raw.slice().sort()
    .map(name => name.replace(/\s*\(the\)$/, ''));
    res.render("listings/edit.ejs", { listing, countries });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let currentListing = await Listing.findById(id);
    if(!currentListing){
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    if(currentListing.owner.toString() !== req.user._id.toString()){
        req.flash('error', 'You do not have permission to edit this listing!');
        return res.redirect(`/listings/${id}`);
    }
    // Accept either nested `listing` payload or top-level fields
    const payload = req.body && req.body.listing ? req.body.listing : req.body;
    // If a new file was uploaded, update the image object from multer/Cloudinary
    if (req.file) {
        payload.image = { url: req.file.path, filename: req.file.filename };
    }
    else{
        payload.image = currentListing.image;
    }
    // --- Geocode updated location/country (same approach as createListing) ---
    // Prefer the newly submitted location, fall back to existing listing values
    const locationToSearch = payload.location || currentListing.location;
    let coords = null;
    if (locationToSearch) {
        try {
            let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationToSearch)}&format=json&limit=1`;
            let response = await fetch(url);
            let data = await response.json();
            if (data && data.length > 0) {
                coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            } else {
                // fallback to country
                const countryToSearch = payload.country || currentListing.country;
                if (countryToSearch) {
                    let countryUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(countryToSearch)}&format=json&limit=1`;
                    let countryResponse = await fetch(countryUrl);
                    let countryData = await countryResponse.json();
                    if (countryData && countryData.length > 0) {
                        coords = { lat: parseFloat(countryData[0].lat), lon: parseFloat(countryData[0].lon) };
                    }
                }
            }
        } catch (e) {
            console.warn('Geocoding failed during update:', e.message || e);
            coords = null;
        }
    }
    if (coords) {
        payload.geography = { type: 'Point', coordinates: [coords.lon, coords.lat] };
    }
    await Listing.findByIdAndUpdate(id, { ...payload });
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let currentListing = await Listing.findById(id);
    if(!currentListing){
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    if(currentListing.owner.toString() !== req.user._id.toString()){
        req.flash('error', 'You do not have permission to delete this listing!');
        return res.redirect(`/listings/${id}`);
    }
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
}