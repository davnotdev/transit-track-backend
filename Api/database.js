const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

class database {
  async createUsers(email, name, password, vehicleType, transitCompany, busNumber, busDestination) {
    await prisma.admin.create({
      data: {
        email: email,
        name: name,
        password: password,
        vehicleType: vehicleType || "",
        transitCompany: transitCompany || "",
        busNumber: busNumber || "",
        busDestination: busDestination || ""
      }
    });
  }

  async checkUser(email, password){
    const user = await prisma.admin.findUnique({
      where: {
        email: email,
        password: password
      },
    } 
    )
    if (user){
      console.log("True")
    } else {
      console.log("False")
    }
  }

  async readAllUsers() {
    const users = await prisma.admin.findMany();
    return users;
  }

  async readUser(busDestination) {
    const user = await prisma.admin.findFirst({
      where: {
        busDestination: busDestination
      }
    });

    return user;
  }

  async updateUser(email, vehicleType, transitCompany) {
    await prisma.admin.update({
      where: {
        email: email
      },
      data: {
        vehicleType: vehicleType,
        transitCompany: transitCompany,
      }
    });
  }

  async deleteUser(email) {
    await prisma.admin.delete({
      where: {
        email: email
      }
    });
  }
}

module.exports = database;
