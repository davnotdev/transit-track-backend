// import { PrismaClient } from "@prisma/client";
const PrismaClient = require('@prisma/client')
require("dotenv").config();

const prisma = new PrismaClient();

class Database {
  async createUsers(
    email: string,
    name: string,
    password: string,
    vehicleType: string,
    transitCompany: string,
    busNumber: string,
    busDestination: string,
  ) {
    await prisma.admin.create({
      data: {
        email: email,
        name: name,
        // @ts-ignore
        password: password,
        vehicleType: vehicleType || "",
        transitCompany: transitCompany || "",
        busNumber: busNumber || "",
        busDestination: busDestination || "",
      },
    });
  }

  async checkUser(email: string, password: string) {
    const user = await prisma.admin.findUnique({
      where: {
        email: email,
        // @ts-ignore
        password: password,
      },
    });
    if (user) {
      console.log("True");
    } else {
      console.log("False");
    }
  }

  async readAllUsers() {
    const users = await prisma.admin.findMany();
    return users;
  }

  async readUser(busDestination: string) {
    const user = await prisma.admin.findFirst({
      where: {
        busDestination: busDestination,
      },
    });

    return user;
  }

  async updateUser(email: string, vehicleType: string, transitCompany: string) {
    await prisma.admin.update({
      where: {
        email: email,
      },
      data: {
        vehicleType: vehicleType,
        transitCompany: transitCompany,
      },
    });
  }

  async deleteUser(email: string) {
    await prisma.admin.delete({
      where: {
        email: email,
      },
    });
  }
}

module.exports = { Database };

