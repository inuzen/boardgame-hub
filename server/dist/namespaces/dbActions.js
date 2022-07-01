"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoles = exports.findAndDeletePlayer = exports.updatePlayer = exports.createPlayer = exports.updateRoom = exports.createRoom = exports.removeRoomAndPlayers = exports.getPlayerList = void 0;
const db_1 = require("../config/db");
const engine_1 = require("./engine");
const getPlayerList = async (roomCode) => {
    const players = await db_1.AvalonPlayer.findAll({
        where: {
            roomCode,
        },
    });
    return players;
};
exports.getPlayerList = getPlayerList;
const removeRoomAndPlayers = async (roomCode) => {
    const room = await db_1.AvalonRoom.findOne({
        where: {
            roomCode,
        },
    });
    if (room) {
        await Promise.all([
            db_1.AvalonRoom.destroy({
                where: {
                    roomCode,
                },
            }),
            db_1.AvalonPlayer.destroy({
                where: {
                    roomCode,
                },
            }),
        ]);
    }
};
exports.removeRoomAndPlayers = removeRoomAndPlayers;
const createRoom = async (roomCode) => {
    await db_1.AvalonRoom.findOrCreate({
        where: {
            roomCode,
        },
    });
};
exports.createRoom = createRoom;
const updateRoom = async (roomCode, newData) => {
    await db_1.AvalonRoom.update(newData, {
        where: {
            roomCode,
        },
    });
};
exports.updateRoom = updateRoom;
const createPlayer = async ({ roomCode, name, socketId }) => {
    await db_1.AvalonPlayer.create({
        roomCode,
        name,
        socketId,
    });
};
exports.createPlayer = createPlayer;
const updatePlayer = async ({ socketId, updatedProperties }) => {
    await db_1.AvalonPlayer.update(updatedProperties, {
        where: {
            socketId: socketId,
        },
    });
};
exports.updatePlayer = updatePlayer;
// TODO make appropriate changes if at some point the same socket will be used for multiple rooms
const findAndDeletePlayer = async (socketId) => {
    try {
        const player = await db_1.AvalonPlayer.findOne({
            where: {
                socketId,
            },
        });
        if (player) {
            await db_1.AvalonPlayer.destroy({
                where: {
                    socketId,
                },
            });
            const players = await db_1.AvalonPlayer.findAll({
                where: {
                    // @ts-ignore
                    roomCode: player.roomCode,
                },
            });
            // @ts-ignore
            this.ns.to(player.roomCode).emit('players', players);
        }
    }
    catch (e) {
        console.log(e);
    }
};
exports.findAndDeletePlayer = findAndDeletePlayer;
const assignRoles = async (roomCode) => {
    const players = await (0, exports.getPlayerList)(roomCode);
    const playerCount = players.length;
    const rolesForPlayers = (0, engine_1.createRoleDistributionArray)(playerCount);
    const updateArray = players.map((player, i) => {
        return (0, exports.updatePlayer)({
            socketId: player.socketId,
            updatedProperties: { role: rolesForPlayers[i].roleName },
        });
    });
    await Promise.all(updateArray);
};
exports.assignRoles = assignRoles;
