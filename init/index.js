const mongoose = require('mongoose');
const initData = require('./data');
const Listing = require('../models/listing.js');

main().then( () =>{
    console.log('Connected to MongoDB');
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/travelhub');
}

const initDB = async () => {
    await Listing.deleteMany({});
    // map the seed data to include an owner and insert the resulting array
    const listings = initData.data.map(obj => ({ ...obj, owner: "69021a9c46fec44e2b41c41e" }));
    await Listing.insertMany(listings);
    console.log("Database Initialized");
}
initDB();