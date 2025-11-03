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
        url: String,
        filename: String
        },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
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