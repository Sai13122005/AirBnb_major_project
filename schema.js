//this is the sever side schema with validation using tool joi

const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string(),
        price: joi.number().required().min(0),
        country: joi.string().required(),
        location: joi.string().required(),
        image: joi.string().allow("", null),

    }).required()
});

//for documentation of joi: https://joi.dev/api/18.x.