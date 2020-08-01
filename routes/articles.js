const express = require("express");
const router = express.Router();

// Bring in Article model
let Article = require("../models/article");

// Add route
router.get("/add", (req, res) => {
  res.render("add_article", {
    title: "Add Article",
  });
});

// Add Submit POST route
router.post("/add", (req, res) => {
  // Validation rules
  req.checkBody("title", "Title is required!").notEmpty();
  req.checkBody("author", "Author is required!").notEmpty();
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
    article.author = req.body.author;
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

// Load edit form
router.get("/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("edit_article", {
      title: "Edit article",
      article: article,
    });
  });
});

// Update Submit POST route
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
  let query = { _id: req.params.id };

  Article.deleteOne(query, function (err) {
    if (err) {
      console.log(err);
    }
    res.send("Success");
  });
});

// Get single article
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("article", {
      article: article,
    });
  });
});

module.exports = router;
