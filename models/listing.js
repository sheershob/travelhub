const mongoose = require('mongoose');   
const review = require('./review');
const { required } = require('joi');
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxLength: 500,
        required: true
    },
    price: {
        type: Number,
        min: 100,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://img.freepik.com/free-photo/type-entertainment-complex-popular-resort-with-pools-water-parks-turkey-with-more-than-5-million-visitors-year-amara-dolce-vita-luxury-hotel-resort-tekirova-kemer_146671-18728.jpg?semt=ais_hybrid&w=740&q=80",
        set: (v) => v === "" ? "https://img.freepik.com/free-photo/type-entertainment-complex-popular-resort-with-pools-water-parks-turkey-with-more-than-5-million-visitors-year-amara-dolce-vita-luxury-hotel-resort-tekirova-kemer_146671-18728.jpg?semt=ais_hybrid&w=740&q=80" : v
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review'
      }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Listing = mongoose.model('Listing', ListingSchema);
module.exports = Listing;