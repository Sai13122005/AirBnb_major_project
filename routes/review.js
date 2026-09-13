const express = require("express");
const router = express.Router({mergeParams: true});//mergeparams to access parameterof parent route(listings/:id/reviews)(here)
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Reviews = require("../models/reviews.js");
const {ReviewSchema}= require("../schema.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next)=>{
    let {error} = ReviewSchema.validate(req.body);
    console.log(error);
    if(error)
    {
        throw new ExpressError(400, error);
    }
    else{
        next();
    }
}
// adding Reviews
router.post("/",validateReview, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Reviews(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));
//delete review
router.delete("/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Reviews.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;