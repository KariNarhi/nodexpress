const express = require("express");
const router = express.Router();

// Bring in Article model
let Article = require("../models/article");

// Bring in User model
let User = require("../models/user");

// Add GET route
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("add_article", {
    title: "Add Article",
  });
});

// Add Submit POST route
router.post("/add", (req, res) => {
  // Validation rules
  req.checkBody("title", "Title is required!").notEmpty();
  req.checkBody("body", "Body is required!").notEmpty();

  // Get errors
  let errors = req.validationErrors();

  if (errors) {
    res.render("add_article", {
      title: "Add Article",
      errors: errors,
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Article added");
        res.redirect("/");
      }
    });
  }
});

// Load EDIT form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash("danger", "Not authorized!");
      return res.redirect("/");
    }
    res.render("edit_article", {
      title: "Edit article",
      article: article,
    });
  });
});

// UPDATE Submit POST route
router.post("/edit/:id", (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.updateOne(query, article, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article updated");
      res.redirect("/");
    }
  });
});

// DELETE route
router.delete("/:id", function (req, res) {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = { _id: req.params.id };

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
});

// Get single article
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("article", {
        article: article,
        author: user.name,
      });
    });
  });
});

// Access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please log in");
    res.redirect("/users/login");
  }
}

module.exports = router;
