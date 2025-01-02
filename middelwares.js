const { model } = require("mongoose")
const Listing = require("./models/listing")
const Review = require("./models/review")
module.exports.isLoggedIn = (req,res,next)=>{
    req.session.redirectUrl = req.originalUrl
    if(!req.isAuthenticated()){
        req.flash("error","User not logged in")
        return res.redirect("/login")
    }
    next()
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl    
    }
    next()
}

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorised")
       return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req,res,next) => {
    let {id,reviewId} = req.params
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorised")
       return res.redirect(`/listings/${id}`)
    }
    next()
}