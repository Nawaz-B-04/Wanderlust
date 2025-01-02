const User = require("../models/user")
module.exports.signup = async (req,res)=>{
    try{
        let { username,email, password} = req.body;
        const newUser = new User({email,username})
        const regUser = await User.register(newUser, password)
        console.log(regUser)
        req.login(regUser,(err) =>{
            if(err){
               return next(err)
            }
            req.flash("success", "Welcome to wanderlust")
            res.redirect("/listings")    
        })
       
    }
    catch(err){
        req.flash("error", err.message)
        res.redirect("/signup")
    }
    }
    module.exports.renderSignup = (req,res)=>{
        res.render("users/signup.ejs")
    }
    module.exports.login = async (req,res)=>{
        req.flash("success","Welcome back my G")
        let redirectUrl = res.locals.redirectUrl || "/listings"
        res.redirect(redirectUrl) //the problem was when redirecting the session is closed so it wont have same redirecturl, so we can store in locals and passport doesnt have option to delete locals
    }
    module.exports.logout = (req,res,next)=>{
        req.logout((err) =>{
            if(err){
               return next(err)
            }
            req.flash("success", "You are logged out")
            return res.redirect("/listings")
        })
    }