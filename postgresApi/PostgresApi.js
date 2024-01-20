const { Pool } = require('pg');
const {PrismaClient} = require('@prisma/client')
require('dotenv').config();

const prisma = new PrismaClient()

export const CreateUsers = async (email, name, password, vehicleType, transitCompany, busNumber, busDestination) =>{
  await prisma.admin.create({
    data:{
      email: email,
      name: name, 
      password: password,
      vehicleType: vehicleType || "", 
      transitCompany: transitCompany || "", 
      busNumber: busNumber || "", 
      busDestination: busDestination || "" 
    } 
  })
}

export const ReadAllUsers = async () => {
    const Users = await prisma.admin.findMany();

    return Users 
}

export const ReadUsers = async (busDestination) => {
    const User = await prisma.admin.findFirst({
        where: {
            busDestination: busDestination
        }
    });

    return User 
}

export const UpdateUser = async (email, vehicleType, transitCompany, ) => {
    await prisma.admin.update({
        where:{
            email: email
        },
        data: {
            vehicleType: vehicleType,
            transitCompany: transitCompany,
        } 
    })
}

export const DeleteUser = async(email) => {
    await prisma.admin.delete({
        where: {
            email: email
        }
    })
}