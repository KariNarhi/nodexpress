const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Mongoose setup
mongoose.connect("mongodb://localhost/nodexpress", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;

// Check connection
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Check for db errors
db.on("error", (err) => {
  console.log(err);
});

// Init app
const app = express();

// Set Content Security Policies
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Content-Security-Policy": "default-src *",
    "X-Content-Security-Policy": "default-src *",
    "X-WebKit-CSP": "default-src *",
  });
  next();
});

// Bring in models
let Article = require("./models/article");

// Load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Articles",
        articles: articles,
      });
    }
  });
});

// Get single article
app.get("/article/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("article", {
      article: article,
    });
  });
});

// Add route
app.get("/articles/add", (req, res) => {
  res.render("add_article", {
    title: "Add Article",
  });
});

// Add Submit POST route
app.post("/articles/add", (req, res) => {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save((err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect("/");
    }
  });
});

// Load edit form
app.get("/article/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("edit_article", {
      title: "Edit article",
      article: article,
    });
  });
});

// Update Submit POST route
app.post("/article/edit/:id", (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.update(query, article, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect("/");
    }
  });
});

// DELETE route
app.delete("/article/:id", function (req, res) {
  let query = { _id: req.params.id };

  Article.deleteOne(query, function (err) {
    if (err) {
      console.log(err);
    }
    res.send("Success");
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000...");
});
