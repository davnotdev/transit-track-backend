import express from "express";
import { Database } from "./api/database";
import { Pool } from "pg";

const app = express();
const userDb = new Database();

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

app.get("/", (req:Request, res:any) => {
  getPostgresVersion();
});

app.get("/login", (req:any, res:any) => {
  userDb.checkUser("yalambersubba13@gmail.com", "wristking");
});

app.get("/signup", (req:any, res:any) => {
  userDb.createUsers(
    "yalambersubba13@gmail.com",
    "Yalamber Subba",
    "wristking",
    "bus",
    "AC transit",
    "51A",
    "Fruitvale Bart",
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
