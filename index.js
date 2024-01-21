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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { Database } from "./api/database";
const database_1 = require("./api/database");
// import { Pool } from "pg";
const pg_1 = require("pg");
const tracker_1 = require("./tracker");
const adminToken_1 = require("./adminToken");
const transit_1 = require("./transit");
var transit;
() => __awaiter(void 0, void 0, void 0, function* () {
    transit = yield (0, transit_1.fetchTransitData)();
});
const app = (0, express_1.default)();
const userDb = new database_1.Database();
const tracker = (0, tracker_1.createTracker)();
const adminTokenMan = (0, adminToken_1.createAdminTokenMan)();
app.use(express_1.default.json());
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
const getPostgresVersion = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        const response = yield client.query("SELECT version()");
        console.log(response.rows[0]);
    }
    finally {
        client.release();
    }
});
const port = process.env.PORT || 8080;
app.get("/", (req, res) => {
    getPostgresVersion();
    res.send("Hello World");
});
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const userExists = yield userDb.checkUser(email);
        if (userExists) {
            console.log("user exists");
            if (userExists.password == password) {
                let token = (0, adminToken_1.adminTokenLogin)(adminTokenMan, email);
                (0, tracker_1.trackerInitialUpdateAdmin)(tracker, token);
                res.status(200).send({
                    token,
                });
            }
        }
        else {
            res.status(404).send("User not found.");
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during login.");
    }
}));
app.post("/api/signup", (req, res) => {
    const { email, name, password, vehicleType, transitCompany } = req.body;
    // Make sure to handle the async operation properly
    userDb
        .createUsers(email, name, password, vehicleType, transitCompany, "", "")
        .then(() => {
        res.status(201).send("User created");
    })
        .catch((error) => {
        res.status(500).send("Error creating user");
    });
});
app.post("/api/update_location", (req, res) => {
    const { isAdmin, token, location } = req.body;
    if (isAdmin) {
        (0, tracker_1.trackerUpdateAdmin)(tracker, token, location);
    }
    else {
        (0, tracker_1.trackerUpdateUser)(tracker, token, location);
    }
    res.send("ok");
});
app.post("/api/calculate_density", (req, res) => {
    const { userToken } = req.body;
    let closestAdmin = (0, tracker_1.trackerGetClosestAdmin)(tracker, userToken);
    if (!closestAdmin) {
        res.status(500).send({ no: "admins avaliable" });
        return;
    }
    let density = (0, tracker_1.trackerCalculateDensity)(tracker, closestAdmin);
    res.send({ density });
});
app.get("/api/get_transit_data", (_, res) => {
    res.send(transit);
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
