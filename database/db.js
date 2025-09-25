const mongoose = require("mongoose");
require("dotenv").config();

const connect = () => {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  });
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});

module.exports = connect;