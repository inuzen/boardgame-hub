"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByUUID = exports.createUser = void 0;
const db_1 = require("../../config/db");
const createUser = async () => {
    const user = await db_1.CommonUser.create();
    return user;
};
exports.createUser = createUser;
const getUserByUUID = async (uuid) => {
    const user = await db_1.CommonUser.findOne({
        where: {
            uuid,
        },
    });
    return user;
};
exports.getUserByUUID = getUserByUUID;
// export const updateUser = async (user) => {};
