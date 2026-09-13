const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const method_override = require("method-override");
const Listing = require("./models/listing");
const app = express();
const path = require("path");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, ReviewSchema}= require("./schema.js");
const Reviews = require("./models/reviews");
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(method_override("_method"));
app.use(express.static(path.join(__dirname, "/public")));

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
app.listen(8080, () => {
    console.log('server is listening on 8080');
});
// app.get("/listing", (req, res)=>{
//     Listing.find({}).then((result)=>{
//         console.log(result);
//         res.send(result);
//     }).catch((err)=>{
//         console.log(err);
//     });

// });
//we can write schemaValidation as a middleware
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
//index Route
app.get("/listings", async (req, res) => {
    const allList = await Listing.find({});
    res.render("listings/index.ejs", { allList });
});

//new route
app.get("/listings/new", (req, res) => {
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
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
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

app.get("/", (req, res) => {
    res.send("hello");
});

//show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const data = await Listing.findById(req.params.id).populate("reviews");
    res.render("listings/show.ejs", { data });
}));
// adding Reviews
app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Reviews(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));
//delete review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Reviews.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))
//Edit Route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const data = await Listing.findById(id);
    res.render("listings/edit.ejs", { data });
}));
//update route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
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
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// app.get("/testListing", async (req,res)=>{
//     let sample = new Listing({
//         title: "farm house",
//         description: "parties",
//         price: 20000,
//         location: "Hyderabad",
//         country: "India"
//     });
//     await sample.save();
//     console.log("Sample Saved");
//     res.send("Successfully saved");
// })
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
    //res.send("Some thing went wrong");
});
app.get("/", (req, res) => {
    res.send("hello");
});