// import express from "express";
const express = require('express')
// import { Database } from "./api/database";
const {Database} = require('./api/database')
// import { Pool } from "pg";
const {Pool} = require('pg')

const app = express();
const userDb = new Database();

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
});

// app.post("/api/login", async (req, res) => {
//     const { email, password } = req.body;
    
//     try {
//       const user = await userDb.checkUser(email, password);
      
//       if (user) {
//         // Assuming checkUser returns a user object on successful login
//         // Send back a success status code and possibly a token or user details
//         res.status(200).send("Login successful");
//       } else {
//         // If credentials are wrong, typically a 401 Unauthorized status is sent
//         res.status(401).send("Invalid credentials");
//       }
//     } catch (error) {
//       // For other errors, a 500 Internal Server Error status is used
//       console.error(error);
//       res.status(500).send("An error occurred during login");
//     }
//   });
  
app.post("/api/login", async (req, res) => {
    const { email } = req.body;
    try {
      const userExists = await userDb.checkUser(email);
      if (userExists) {
        // Here you would normally proceed to check the password, etc.
        res.status(200).send("User exists.");
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
    userDb.createUsers(
      email,
      name, 
      password,
      vehicleType,
      transitCompany,
      "",
      "" 
    ).then(() => {
      res.status(201).send("User created");
    }).catch((error) => {
      res.status(500).send("Error creating user");
    });
  });
  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
