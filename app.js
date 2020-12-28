const express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    mongoose = require("mongoose"),
    app = express();

// use bodyParser to interpret post req bodies
app.use(bodyParser.urlencoded({ extended: true }));
// epressSanitizer needs to be after bodyParser
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// set up mongoose
mongoose.connect("mongodb://localhost:27017/restfull_birdblog", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const birdblogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: String, default: Date }
});

const Birdblog = mongoose.model("blog", birdblogSchema);

// Birdblog.create({
//     title: "Vultures are realy underrated creatures",
//     image: "https://idsb.tmgrup.com.tr/ly/uploads/images/2020/03/25/thumbs/1200x600/26936.jpg",
//     body: "Vultures have a bad reputation, and I realy don't know why. My guess: they eat dead beings"
// }, () => console.log("New birdblog!"));

// routes
app.get("/", (req, res) => {
    res.redirect("/birdblog");
})

// index route
app.get("/birdblog", (req, res) => {
    Birdblog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index.ejs", { blogs });
        }
    })
})

// "new" route
app.get("/birdblog/new", (req, res) => {
    res.render("new.ejs");
})

// create rout
app.post("/birdblog", (req, res) => {
    // sanitize the html input before displaying
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Birdblog.create(req.body.blog, (err, blog) => {
        if (err) {
            res.redirect("/birdblog/new");
        } else {
            res.redirect("/birdblog");
        }
    })
})

// show route
app.get("/birdblog/:id", (req, res) => {
    Birdblog.findById(req.params.id, (err, blog) => {
        if (err) {
            res.redirect("/birdblog");
        } else {
            res.render("show.ejs", { blog });
        }
    })
})

// edit route
app.get("/birdblog/:id/edit", (req, res) => {
    Birdblog.findById(req.params.id, (err, blog) => {
        if (err) {
            console.log(err);
            // res.redirect("/birdblog");
        } else {
            res.render("edit.ejs", { blog });
        }
    })
})

// update route
app.put("/birdblog/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Birdblog.findByIdAndUpdate(req.params.id, req.body.blog, (err, blog) => {
        if (err) {
            res.redirect("/birdblog");
        } else {
            res.redirect("/birdblog/" + req.params.id);
        }
    })
})

// delete route
app.delete("/birdblog/:id", (req, res) => {
    Birdblog.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            res.redirect("/birdblog");
            console.log(err);
        } else {
            res.redirect("/birdblog");
        }
    })
})

// initializing server
app.listen(3000, () => console.log("BirdBlog is alive!"));