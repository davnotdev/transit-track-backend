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

app.get("/", (req: Request, res: any) => {
  getPostgresVersion();
  res.send("Hello World");
});

app.post("/api/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const userExists = await userDb.checkUser(email);
    if (userExists) {
      console.log("user exists");
      if (userExists.password == password) {
        let token = adminTokenLogin(adminTokenMan, email);
        trackerInitialUpdateAdmin(tracker, token);
        res.status(200).send({
          token,
        });
      }
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during login.");
  }
});

app.post("/api/signup", (req: any, res: any) => {
  const { email, name, password, vehicleType, transitCompany } = req.body;
  // Make sure to handle the async operation properly
  userDb
    .createUsers(email, name, password, vehicleType, transitCompany, "", "")
    .then(() => {
      res.status(201).send("User created");
    })
    .catch((error: any) => {
      res.status(500).send("Error creating user");
    });
});

app.post("/api/update_location", (req: any, res: any) => {
  const { isAdmin, token, location } = req.body;
  if (isAdmin) {
    trackerUpdateAdmin(tracker, token, location);
  } else {
    trackerUpdateUser(tracker, token, location);
  }
  res.send("ok");
});

app.post("/api/calculate_density", (req: any, res: any) => {
  const { userToken } = req.body;
  let closestAdmin = trackerGetClosestAdmin(tracker, userToken);
  if (!closestAdmin) {
    res.status(500).send({ no: "admins avaliable" });
    return;
  }
  let density = trackerCalculateDensity(tracker, closestAdmin);
  res.send({ density });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
