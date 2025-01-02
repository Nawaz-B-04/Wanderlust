const express = require("express")
const router = express.Router({ mergeParams: true });
const wrapAsync= require("../utils/wrapAsync.js")
const ExpressErrors = require("../utils/ExpressErrors.js")
const {reviewSchema} = require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js")
const {isLoggedIn,isReviewAuthor} = require("../middelwares.js")
const reviewController = require("../controllers/review.js")

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressErrors(400, error.details.map((e) => e.message).join(", "));
    } else {
        next();
    }
};
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));


//delete review
router.delete(
    "/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview)
);
module.exports = router
