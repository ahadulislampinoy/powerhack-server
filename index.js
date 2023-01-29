require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const bcytpt = require("bcryptjs");
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

// Verify json web token
const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
  });
  next();
};

async function run() {
  try {
    const allUser = client.db("powerhack").collection("users");
    const allBillings = client.db("powerhack").collection("billings");

    // Registration route
    app.post("/api/registration", async (req, res) => {
      const { name, email, password } = req.body;
      const query = { email: email };
      // Finding is user exist already in database or not
      const user = await allUser.findOne(query);
      if (user) {
        return res.send({ message: "User already exist" });
      }
      // Hashing password
      const encryptedPassword = await bcytpt.hash(password, 10);
      const userData = {
        name: name,
        email: email,
        password: encryptedPassword,
      };
      const result = await allUser.insertOne(userData);
      if (result.insertedId) {
        const token = jwt.sign(userData, process.env.JWT_TOKEN);
        return res.send({ token, message: "User created successfully" });
      }
    });

    // Login route
    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;
      const query = { email: email };
      // Finding is user exist already in database or not
      const user = await allUser.findOne(query);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      // Comparing password
      if (await bcytpt.compare(password, user.password)) {
        const token = jwt.sign(user, process.env.JWT_TOKEN);
        if (res.status(201)) {
          return res.send({ token, message: "Login successfull!" });
        }
      }
      res.status(401).send({ message: "Incorrect password" });
    });

    // Get single user data
    app.post("/api/userData", async (req, res) => {
      const { token } = req.body;
      const user = jwt.verify(token, process.env.JWT_TOKEN);
      const query = { email: user.email };
      const result = await allUser.findOne(query);
      if (result) {
        return res.send(result);
      }
    });
  } finally {
  }
}
run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Power Hack Server is running on port: ${port}`);
});
