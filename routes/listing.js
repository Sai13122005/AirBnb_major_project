const express = require("express");
const router = express.Router();
const {listingSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const reviews = require("./review.js");
const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    console.log(error);
    if(error)
    {
        throw new ExpressError(400, error);
    }
    else{
        next();
    }
}
//index Route
router.get("/", async (req, res) => {
    const allList = await Listing.find({});
    res.render("listings/index.ejs", { allList });
});

//new route
router.get("/new", (req, res) => {
    res.render("listings/create.ejs");
});
//create route
// app.post("/listings", async (req, res, next) => {
//     try {
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
//     } catch (err) {
//         next(err);
//     }

// });
// or we can handle error in different way
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    // if(req.body.listing === undefined)
    // {
    //     throw new ExpressError(400, "Send Valid data for listing");
    // }

    //the below schema validation is written in a middleware named: validateListing
    // let result= listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error)
    // {
    //     throw new ExpressError(400, result.error);
    // }


    const newListing = new Listing(req.body.listing);
    //the below written code for schemaValidation is not a good practice.it is not suitable 
    // instance having many models

    // we can joi.dev(npm package) tool to validate schema   
    // if(!newListing.description)
    // {
    //     throw new ExpressError(400, "Description is required");
    // }
    // if(!newListing.location)
    // {
    //     throw new ExpressError(400, "location is required");
    // }
    // if(!newListing.country)
    // {
    //     throw new ExpressError(400, "country is required");
    // }
    // we can joi.dev(npm package) tool to validate schema   
    await newListing.save();

    res.redirect("/listings");
}));



//show route
router.get("/:id", wrapAsync(async (req, res) => {
    const data = await Listing.findById(req.params.id).populate("reviews");
    res.render("listings/show.ejs", { data });
}));

//Edit Route

router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const data = await Listing.findById(id);
    res.render("listings/edit.ejs", { data });
}));
//update route
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    //await Listing.findByIdAndUpdate(id, {...req.body.listing}, {runValidators: true});
    const price = req.body.listing.price ? Number(req.body.listing.price) : undefined;
    await Listing.findByIdAndUpdate(id, {
        title: req.body.listing.title,
        description: req.body.listing.description,
        price: price,
        image: { url: req.body.listing.image },
        location: req.body.listing.location,
        country: req.body.listing.country,
    }, { runValidators: true });
    res.redirect(`/listings/${id}`);
}));

//delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));
router.use("/:id/reviews", reviews);
module.exports = router;