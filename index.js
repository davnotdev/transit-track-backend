const express = require("express")
const UserDatabase = require('./Api/database')
const userDb = new UserDatabase();
const { Pool } = require('pg');
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

app.get("/", (req, res) => {
  getPostgresVersion();
});

app.post("/api/login", (req, res) =>{
  userDb.checkUser("yalambersubba13@gmail.com", "wristking")
})

app.get("/api/signup", (req, res) =>{
  userDb.createUsers("yalambersubba13@gmail.com", "Yalamber Subba", "wristking", "bus", "AC transit", "51A", "Fruitvale Bart");
})

// app.get("/")
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
