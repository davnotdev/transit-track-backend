"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminTokenLogin = exports.createAdminTokenMan = void 0;
const uuid_1 = require("uuid");
function createAdminTokenMan() {
    return {
        tokens: new Map(),
    };
}
exports.createAdminTokenMan = createAdminTokenMan;
function adminTokenLogin(tokenMan, email) {
    let token = (0, uuid_1.v4)();
    tokenMan.tokens.set(email, token);
    return token;
}
exports.adminTokenLogin = adminTokenLogin;
