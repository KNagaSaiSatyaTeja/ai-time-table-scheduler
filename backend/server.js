const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
