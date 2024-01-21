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
import { TransitData, fetchTransitData } from "./transit";

var transit: TransitData;

(async () => {
  transit = await fetchTransitData();
})();

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
  const { email, password, transit } = req.body;
  try {
    const userExists = await userDb.checkUser(email);
    console.log(userExists);
    if (userExists) {
      console.log("user exists");
      if (userExists.password == password) {
        let token = adminTokenLogin(adminTokenMan, email, JSON.parse(transit));
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
    console.log("locc", location);
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

app.get("/api/get_transit_data", (_: any, res: any) => {
  res.send(transit);
});

app.post("/api/get_profile", (req: any, res: any) => {
  const { token } = req.body;
  let email = null;
  for (let key of adminTokenMan.tokens.keys()) {
    let val = adminTokenMan.tokens.get(key)!;
    if (val.token == token) {
      email = key;
      break;
    }
  }
  if (!email) {
    res.status(500).send({ no: "admins avaliable" });
    return;
  }
  res.send(userDb.getProfile(email));
});

app.get("/api/get_transits", (_: any, res: any) => {
  let adminDatas = [];
  for (let adminKey of adminTokenMan.tokens.keys()) {
    let adminData = adminTokenMan.tokens.get(adminKey)!;
    adminDatas.push({
      location: tracker.admin_locations.get(adminData.token)!,
      transit: adminData.transit,
    });
  }
  res.send({
    transits: adminDatas,
  });
});

app.post("/api/get_admin_location_with_transit", (req: any, res: any) => {
  let { transit } = req.body;
  let adminTokens = [];

  for (let adminKey of adminTokenMan.tokens.keys()) {
    let adminData = adminTokenMan.tokens.get(adminKey)!;
    console.log("cmp", adminData.transit, transit);
    if (deepEqual(adminData.transit, transit)) {
      adminTokens.push(adminData.token);
    }
  }

  console.log(
    "locs",
    adminTokens,
    tracker.admin_locations,
    adminTokens.map((it) => tracker.admin_locations.get(it)!),
  );
  res.send({
    locations: adminTokens.map((it) => tracker.admin_locations.get(it)!),
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function deepEqual(obj1: any, obj2: any): boolean {
  // Check if both arguments are objects
  if (
    typeof obj1 === "object" &&
    obj1 !== null &&
    typeof obj2 === "object" &&
    obj2 !== null
  ) {
    // Get the keys of both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Check if the number of keys is the same
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Check if each key and its corresponding value are deep equal
    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    // If all keys and values are deep equal, return true
    return true;
  } else {
    // If not both objects, compare values directly
    return obj1 === obj2;
  }
}
