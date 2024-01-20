// import express from "express";
const express = require('express')
// import { Database } from "./api/database";
const {Database} = require('./api/database')
// import { Pool } from "pg";
const {Pool} = require('pg')

const app = express();
const userDb = new Database();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Origin', 'https://ecommerce-ewipdamn7-gutsyguy.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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

app.get("/login", (req, res) => {
  userDb.checkUser("yalambersubba13@gmail.com", "wristking");
});

app.get("/signup", (req, res) => {
  console.log(req.body)
  const {email, name, password, vehicleType, transitCompany} = req.body
  userDb.createUsers(
    email,
    name, 
    password,
    vehicleType,
    transitCompany,
    "",
    "" 
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
