const mongoose = require('mongoose');
const Initdata = require('./data');
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
    await Listing.insertMany(Initdata.data);
    console.log("Database Initialized");
}
initDB();