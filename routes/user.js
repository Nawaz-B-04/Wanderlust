const express = require("express")
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middelwares")
const userController = require("../controllers/users")

router
    .route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync(userController.signup))

router
    .route("/login")
    .get((req, res) => {
        res.render("users/login.ejs")
    })
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.login)


router.get("/logout", userController.logout)

module.exports = router
