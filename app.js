const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const passport = require("passport");
const db_setup = require("./config/database");

// Bring in Article model
let Article = require("./models/article");

// Init app
const app = express();

// Setup database
db_setup();

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

// Passport config
require("./config/passport")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

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
let users = require("./routes/users.js");
app.use("/users", users);

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log("Server started on port " + PORT + "...");
});
