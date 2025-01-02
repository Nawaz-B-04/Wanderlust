const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressErrors = require("../utils/ExpressErrors.js")
const { listingSchema } = require("../schema.js")
const Listing = require("../models/listing.js")
const mongoose = require("mongoose")
const { isLoggedIn, isOwner } = require("../middelwares.js")
const listingController = require("../controllers/listing.js")
const {storage} = require("../cloudConfig.js")
const multer = require('multer')
const upload = multer({ storage })

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressErrors(400, error.details.map((e) => e.message).join(", "));
    } else {
        next();
    }
};

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"), wrapAsync(listingController.createRoute))
    

    

    
//create new route
router.get("/new", isLoggedIn, listingController.renderNewForm)

router
    .route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))




//edit route
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm)



module.exports = router