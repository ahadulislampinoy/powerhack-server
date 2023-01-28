require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.send("Power Hack Server is running!");
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5a1umhj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
  } finally {
  }
}
run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Power Hack Server is running on port: ${port}`);
});
