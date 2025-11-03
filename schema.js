const Joi = require('joi');

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().min(10).max(500),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(100),
        image: Joi.object({ url: Joi.string().allow("", null), filename: Joi.string().allow("", null) })
    }).required()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(10),
        comment: Joi.string().required()
    }).required()
});

module.exports = { listingSchema, reviewSchema };