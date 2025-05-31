const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

try {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB", process.env.MONGODB_URI);
  });
} catch (e) {
  console.log("errror while connecting", e.message);
}

const app = express();
const port = 3000;
app.use(cors());
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
