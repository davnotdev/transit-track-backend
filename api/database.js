"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require('@prisma/client');
require("dotenv").config();
const prisma = new PrismaClient();
class Database {
    createUsers(email, name, password, vehicleType, transitCompany, busNumber, busDestination) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.admin.create({
                data: {
                    email: email,
                    name: name,
                    password: password,
                    vehicleType: vehicleType || "",
                    transitCompany: transitCompany || "",
                    busNumber: busNumber || "",
                    busDestination: busDestination || "",
                },
            });
        });
    }
    checkUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.admin.findFirst({
                where: {
                    email: email,
                    // password: password,
                },
            });
            return user;
        });
    }
    readAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma.admin.findMany();
            return users;
        });
    }
    readUser(busDestination) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.admin.findFirst({
                where: {
                    busDestination: busDestination,
                },
            });
            return user;
        });
    }
    updateUser(email, vehicleType, transitCompany) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.admin.update({
                where: {
                    email: email,
                },
                data: {
                    vehicleType: vehicleType,
                    transitCompany: transitCompany,
                },
            });
        });
    }
    deleteUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.admin.delete({
                where: {
                    email: email,
                },
            });
        });
    }
}
module.exports = { Database };
