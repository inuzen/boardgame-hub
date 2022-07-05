"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoles = exports.findAndDeletePlayer = exports.updatePlayer = exports.createPlayer = exports.updateQuest = exports.initQuests = exports.getQuests = exports.updateRoom = exports.createRoom = exports.getRoomWithPlayers = exports.removeRoomAndPlayers = exports.nominatePlayer = exports.countPlayers = exports.getPlayerBySocketId = exports.getPlayerList = void 0;
const db_1 = require("../config/db");
const engine_1 = require("./engine");
const getPlayerList = async (roomCode) => {
    const players = await db_1.AvalonPlayer.findAll({
        where: {
            roomCode,
        },
        order: [['order', 'ASC']],
    });
    return players;
};
exports.getPlayerList = getPlayerList;
// export const getPlayerRole = async (roomCode: string, socketId: string) => {
//     const player = await AvalonPlayer.findOne({
//         where: {
//             roomCode,
//             socketId,
//         },
//     });
//     return player?.role;
// };
const getPlayerBySocketId = async (roomCode, socketId) => {
    const player = await db_1.AvalonPlayer.findOne({
        where: {
            roomCode,
            socketId,
        },
    });
    return player;
};
exports.getPlayerBySocketId = getPlayerBySocketId;
const countPlayers = async (roomCode) => {
    const playerCount = await db_1.AvalonPlayer.count({
        where: {
            roomCode,
        },
    });
    return playerCount;
};
exports.countPlayers = countPlayers;
const nominatePlayer = async (roomCode, playerId) => {
    const selectedPlayer = await (0, exports.getPlayerBySocketId)(roomCode, playerId);
    if (selectedPlayer) {
        selectedPlayer.nominated = selectedPlayer.nominated ? false : true;
        await selectedPlayer.save();
    }
};
exports.nominatePlayer = nominatePlayer;
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
const getRoomWithPlayers = async (roomCode) => {
    const room = await db_1.AvalonRoom.findOne({
        where: {
            roomCode,
        },
        include: { model: db_1.AvalonPlayer, order: [['order', 'ASC']], attributes: { exclude: ['role'] } },
    });
    return room;
};
exports.getRoomWithPlayers = getRoomWithPlayers;
const createRoom = async (roomCode, socketId) => {
    return await db_1.AvalonRoom.findOrCreate({
        where: {
            roomCode,
        },
        defaults: {
            roomCode,
            hostSocketId: socketId,
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
// get all quests for a room
const getQuests = async (roomCode) => {
    const quests = await db_1.AvalonQuest.findAll({
        where: {
            roomCode,
        },
        order: [['questNumber', 'ASC']],
    });
    return quests;
};
exports.getQuests = getQuests;
const initQuests = async (roomCode, numberOfPlayers) => {
    const { questPartySize } = engine_1.DISTRIBUTION[numberOfPlayers];
    const quests = await db_1.AvalonQuest.findAll({
        where: {
            roomCode,
        },
    });
    if (quests.length) {
        await db_1.AvalonQuest.destroy({
            where: {
                roomCode,
            },
        });
    }
    await db_1.AvalonQuest.bulkCreate(questPartySize.map((partySize, i) => {
        return { roomCode, questNumber: i + 1, questPartySize: partySize, questResult: '', active: i === 0 };
    }));
};
exports.initQuests = initQuests;
const updateQuest = async ({ roomCode, questNumber, questResult, active }) => {
    const currentActiveQuest = await db_1.AvalonQuest.findOne({
        where: {
            roomCode,
            active: true,
        },
    });
    if (currentActiveQuest && currentActiveQuest.questNumber !== questNumber && active) {
        currentActiveQuest.active = false;
        await currentActiveQuest.save();
    }
    await db_1.AvalonQuest.update({ active, questResult: questResult || '' }, {
        where: {
            roomCode,
            questNumber,
        },
    });
};
exports.updateQuest = updateQuest;
const createPlayer = async (player) => {
    await db_1.AvalonPlayer.create(player);
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
// also assigns the first leader
const assignRoles = async (roomCode) => {
    const players = await (0, exports.getPlayerList)(roomCode);
    const playerCount = players.length;
    const firstLeaderOrderNumber = Math.floor(Math.random() * playerCount);
    const rolesForPlayers = (0, engine_1.createRoleDistributionArray)(playerCount);
    const updateArray = players.map((player, i) => {
        return (0, exports.updatePlayer)({
            socketId: player.socketId,
            updatedProperties: {
                role: rolesForPlayers[i].roleName,
                isCurrentLeader: i === firstLeaderOrderNumber,
                order: i,
            },
        });
    });
    await Promise.all(updateArray);
};
exports.assignRoles = assignRoles;
