// import express from "express";
import express from "express";
// import { Database } from "./api/database";
import { Database } from "./api/database";
// import { Pool } from "pg";
import { Pool } from "pg";
import {
  createTracker,
  trackerUpdateUser,
  trackerUpdateAdmin,
  trackerCalculateDensity,
  trackerGetClosestAdmin,
  trackerInitialUpdateAdmin,
} from "./tracker";
import { createAdminTokenMan, adminTokenLogin } from "./adminToken";

const app = express();
const userDb = new Database();
const tracker = createTracker();
const adminTokenMan = createAdminTokenMan();

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const getPostgresVersion = async () => {
  const client = await pool.connect();
  try {
    const response = await client.query("SELECT version()");
    console.log(response.rows[0]);
  } finally {
    client.release();
  }
};

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  getPostgresVersion();
  res.send("Hello World");
});

app.post("/api/login", async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await userDb.checkUser(email);
    if (userExists) {
      // Here you would normally proceed to check the password, etc.
      let token = adminTokenLogin(adminTokenMan, email);
      trackerInitialUpdateAdmin(tracker, token);
      res.status(200).send({
        token,
      });
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during login.");
  }
});

app.post("/api/signup", (req, res) => {
  const { email, name, password, vehicleType, transitCompany } = req.body;
  // Make sure to handle the async operation properly
  userDb
    .createUsers(email, name, password, vehicleType, transitCompany, "", "")
    .then(() => {
      res.status(201).send("User created");
    })
    .catch((error) => {
      res.status(500).send("Error creating user");
    });
});

app.post("/api/update_location", (req, res) => {
  const { isAdmin, token, location } = req.body;
  if (isAdmin) {
    trackerUpdateAdmin(tracker, token, location);
  } else {
    trackerUpdateUser(tracker, token, location);
  }
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
