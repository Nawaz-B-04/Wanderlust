const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.Map_Token;  // Ensure that your Mapbox token is loaded from .env
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Index Route - Show all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { 
        allListings, 
        mapToken: process.env.Map_Token  // Pass the Mapbox token to the view
    });
}

// Show specific listing page
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    
    // Pass the token to the view
    res.render("listings/show.ejs", { 
        listing, 
        mapToken: process.env.Map_Token  // Pass token for map initialization
    });
}

// Create a new listing (with geocoding)
module.exports.createRoute = async (req, res, next) => {
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    let saveListing = await newListing.save();
    req.flash("success", "New Listing Created!!!");
    res.redirect("/listings");
}
// module.exports.createRoute = async (req, res, next) => {
//     try {
//         let response = await geocodingClient
//             .forwardGeocode({
//                 query: req.body.listing.location,
//                 limit: 1
//             })
//             .send();

//         console.log("Geocoding Response:", response.body);

//         if (!response.body.features.length) {
//             req.flash("error", "Location not found. Please enter a valid location.");
//             return res.redirect("/listings/new");
//         }

//         let url = req.file.path;
//         let filename = req.file.filename;
//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id;
//         newListing.image = { url, filename };
//         newListing.geometry = response.body.features[0].geometry;

//         console.log("Geometry Before Save:", newListing.geometry);

//         let saveListing = await newListing.save();
//         console.log("Saved Listing:", saveListing);

//         req.flash("success", "New Listing Created!!!");
//         res.redirect("/listings");
//     } catch (error) {
//         console.error("Error in createRoute:", error.message);
//         req.flash("error", "Something went wrong. Please try again.");
//         res.redirect("/listings/new");
//     }
// };

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing })
}
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path
        let filename = req.file.filename
        listing.image = { url, filename }
        await listing.save()
    }
    req.flash("success", "Listing Updated!!!")
    res.redirect(`/listings/${id}`)
}
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id)
    req.flash("success", "Listing Deleted")
    res.redirect("/listings")
}