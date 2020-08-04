const mongoose = require("mongoose");

const database = "mongodb://localhost:27017/nodexpress";

// Database setup
function db_setup() {
  // Mongoose setup
  mongoose.connect(database, {
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
}

module.exports = db_setup;
