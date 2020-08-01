const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");

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

// Express session middleware
app.use(
  session({
    secret: "nodex",
    resave: true,
    saveUninitialized: true,
  })
);

// Express messages middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Express validator middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      let namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

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

let articles = require("./routes/articles.js");
app.use("/articles", articles);

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000...");
});
