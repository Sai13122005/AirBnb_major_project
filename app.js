const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));


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
app.post("/listings", async (req, res)=>{
    //const {title, description, price,image, location, country} = req.body;
    let newlisting = new Listing({
        title: req.body.listing.title,
        description: req.body.listing.description,
        price: req.body.listing.price,
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