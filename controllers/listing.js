const Listing = require('../models/listing');
const { getNames, getCodes } = require('country-list');

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
    // If a file was uploaded by multer (Cloudinary), attach the url/filename
    if (req.file) {
        console.log('New Listing', req);
        newListing.image = { url: req.file.path, filename: req.file.filename };
    } else if (payload.image && typeof payload.image === 'string') {
        // Accept a user-entered image URL from the form
        newListing.image = { url: payload.image, filename: '' };
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
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
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