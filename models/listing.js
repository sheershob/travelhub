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
    ratings: {
      sum: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      average: { type: Number, default: null }
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    geography: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const Listing = mongoose.model('Listing', ListingSchema);
module.exports = Listing;