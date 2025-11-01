const Listing = require('../models/listing');

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

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
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