if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require('express');
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override")


// let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLAS_DB;


const ejsMate = require("ejs-mate");
const ExpressErrors = require("./utils/ExpressErrors.js")
const { listingSchema } = require("./schema.js")
const listingRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")
const userRouter = require("./routes/user.js")

main().then(() => {
    console.log("connected")
}).catch((err) => {
    console.log(err)
})
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, "/public")))



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
})
store.on("error", () => {
    console.log("Error in MONGO Session Store0", err)
})

const sessionOptions = {
    store,
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions))
app.use(flash())
app.use(express.json());
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())   //store users info in session
passport.deserializeUser(User.deserializeUser())
//remove users info from session
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next()
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email : "nawazishb2004@gmail.com",
//         username : "Nawaz-OG"
//     })

//    const resiteredUser = await User.register(fakeUser, "helloworld")
//     res.send(resiteredUser)
// })


async function main() {
    await mongoose.connect(dbUrl)
}


const cookieparser = require("cookie-parser")
app.use(cookieparser());
app.get("/cookies", (req, res) => {
    res.cookie("name", "nawaz")
    res.send("cookie send")
})


app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewsRouter)
app.use("/", userRouter)

console.log("MAP_TOKEN: ", process.env.MAP_TOKEN);




app.listen(8080, () => {
    console.log("Check out 8080");
})
app.all("*", (req, res, next) => {
    next(new ExpressErrors(404, "Page not found!"))
})
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
})