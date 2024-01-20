const express = require("express")
const { Pool } = require('pg');
const {PrismaClient} = require('@prisma/client')
require('dotenv').config();


const app = express();
const prisma = new PrismaClient()

const QueryUsers = async () =>{
  await prisma.admin.create({
    data:{
      email: "d",
      name: "", 
      vehicleType:"", 
      transitCompany: "", 
      busNumber: "", 
      busDestination: ""
    } 
  })
  const AllUsers = await prisma.admin.findMany()
  console.log(AllUsers)

  await prisma.admin.deleteMany()
}

QueryUsers().then(async () => {
  await prisma.$disconnect()
}).catch(async(e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})

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
