const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const method_override = require("method-override");
const Listing = require("./models/listing");
const app = express();
const path = require("path");
const engine = require("ejs-mate");
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(method_override("_method"));
app.use(express.static(path.join(__dirname, "/public")));

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
app.listen(8080, ()=>
{
    console.log('server is listening');
});
// app.get("/listing", (req, res)=>{
//     Listing.find({}).then((result)=>{
//         console.log(result);
//         res.send(result);
//     }).catch((err)=>{
//         console.log(err);
//     });
    
// });
//index Route
app.get("/listings", async(req, res)=>{
    const allList = await Listing.find({});
    res.render("listings/index.ejs", {allList});
});

//new route
app.get("/listings/new", (req, res)=>{
    res.render("listings/create.ejs");
});
//create route
app.post("/listings", async (req, res)=>{
    //const {title, description, price,image, location, country} = req.body;
    const price = req.body.listing.price ? Number(req.body.listing.price) : undefined;
    let newlisting = new Listing({
        title: req.body.listing.title,
        description: req.body.listing.description,
        price,
        image: { url: req.body.listing.image },
        location: req.body.listing.location,
        country: req.body.listing.country,
    });
    await newlisting.save();
    res.redirect("/listings");
});
//show route
app.get("/listings/:id", async(req, res)=>{
        let {id} = req.params;
        const data = await Listing.findById(id);
        res.render("listings/show.ejs", {data});
});

//Edit Route

app.get("/listings/:id/edit", async(req, res)=>{
    let {id} = req.params;
    const data = await Listing.findById(id);
    res.render("listings/edit.ejs", {data});
});
//update route
app.put("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    //await Listing.findByIdAndUpdate(id, {...req.body.listing}, {runValidators: true});
    const price = req.body.listing.price ? Number(req.body.listing.price) : undefined;
    await Listing.findByIdAndUpdate(id, {
        title: req.body.listing.title,
        description: req.body.listing.description,
        price,
        image: { url: req.body.listing.image },
        location: req.body.listing.location,
        country: req.body.listing.country,
    }, { runValidators: true });
    res.redirect(`/listings/${id}`);
})

//delete Route
app.delete("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

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
app.get("/", (req, res)=>{
    res.send("hello");
});