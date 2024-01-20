const express = require("express")
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

const getPostgresVersion = async () => {
  const client = await pool.connect();
  try {
    const response = await client.query('SELECT version()');
    console.log(response.rows[0]);
  } finally {
    client.release();
  }
}

const port = 8080;

app.get("/", (_req, res) => {
  getPostgresVersion();
});

// app.get("/")

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
