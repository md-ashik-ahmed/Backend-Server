require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const port = 5000;

const auth = require("./Routes/routes");

const app = express();

// parse data
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/routes", auth);

async function main() {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w3t5kee.mongodb.net/?retryWrites=true&w=majority`
  );
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
