const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const method_override = require("method-override");
const app = express();
const path = require("path");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
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

app.get("/", (req, res) => {
    res.send("hello");
});
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


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
