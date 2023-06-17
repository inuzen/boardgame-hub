"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomByCode = exports.addRoom = void 0;
const lokiDB_1 = require("../../config/lokiDB");
const types_1 = require("./types");
const addRoom = (roomCode) => {
    return lokiDB_1.Avalon.insert({
        roomCode,
        players: [],
        takenImages: Object.keys(types_1.AVATARS).reduce((acc, avatar) => {
            acc[avatar] = { key: avatar, taken: false };
            return acc;
        }, {}),
    });
};
exports.addRoom = addRoom;
const getRoomByCode = (roomCode) => lokiDB_1.Avalon.findOne({ roomCode });
exports.getRoomByCode = getRoomByCode;
// export const addPlayer = (newRoom: any, nickname: string, roomCode: string) => {
//     const result = Avalon.findOne({ roomCode });
//     result.players = ['blah'];
//     console.log(result);
//     // newRoom.players = [nickname];
//     // console.log(newRoom);
// };
