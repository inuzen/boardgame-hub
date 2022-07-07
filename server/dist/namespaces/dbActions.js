"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestVote = exports.startNewVoteCycle = exports.clearVotes = exports.handleGlobalVote = exports.switchToNextLeader = exports.assignRoles = exports.updateQuestResult = exports.changeActiveQuest = exports.initQuests = exports.getQuests = exports.updateRoom = exports.getRoom = exports.createRoom = exports.getRoomWithPlayers = exports.removeRoomAndPlayers = exports.nominatePlayer = exports.countPlayers = exports.getPlayerBySocketId = exports.findAndDeletePlayer = exports.updateAllPlayers = exports.updatePlayer = exports.createPlayer = exports.getPlayerList = void 0;
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
const createPlayer = async (player) => {
    await db_1.AvalonPlayer.create(player);
};
exports.createPlayer = createPlayer;
const updatePlayer = async ({ socketId, updatedProperties, }) => {
    await db_1.AvalonPlayer.update(updatedProperties, {
        where: {
            socketId: socketId,
        },
    });
};
exports.updatePlayer = updatePlayer;
const updateAllPlayers = async (roomCode, updatedProperties) => {
    await db_1.AvalonPlayer.update(updatedProperties, {
        where: {
            roomCode,
        },
    });
};
exports.updateAllPlayers = updateAllPlayers;
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
        }
    }
    catch (e) {
        console.log(e);
    }
};
exports.findAndDeletePlayer = findAndDeletePlayer;
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
const countPlayers = async (roomCode, condition) => {
    const playerCount = await db_1.AvalonPlayer.count({
        where: {
            roomCode,
            ...condition,
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
// ROOM
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
        include: [
            { model: db_1.AvalonPlayer, order: [['order', 'ASC']], attributes: { exclude: ['role', 'side'] } },
            { model: db_1.AvalonQuest, order: [['questNumber', 'ASC']] },
        ],
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
const getRoom = async (roomCode) => {
    const room = await db_1.AvalonRoom.findOne({
        where: {
            roomCode,
        },
    });
    return room;
};
exports.getRoom = getRoom;
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
const changeActiveQuest = async (roomCode, questNumber) => {
    if (questNumber > 5) {
        return;
    }
    const currentActiveQuest = await db_1.AvalonQuest.findOne({
        where: {
            roomCode,
            active: true,
        },
    });
    if (currentActiveQuest && currentActiveQuest.questNumber !== questNumber) {
        currentActiveQuest.active = false;
        await currentActiveQuest.save();
    }
    await db_1.AvalonQuest.update({ active: true }, {
        where: {
            roomCode,
            questNumber,
        },
    });
};
exports.changeActiveQuest = changeActiveQuest;
const updateQuestResult = async (roomCode, questNumber, questResult) => {
    await db_1.AvalonQuest.update({ questResult }, {
        where: {
            roomCode,
            questNumber,
        },
    });
};
exports.updateQuestResult = updateQuestResult;
// export const updateQuest = async ({ roomCode, questNumber, questResult, active }: Quest) => {
//     const currentActiveQuest = await AvalonQuest.findOne({
//         where: {
//             roomCode,
//             active: true,
//         },
//     });
//     if (currentActiveQuest && currentActiveQuest.questNumber !== questNumber && active) {
//         currentActiveQuest.active = false;
//         await currentActiveQuest.save();
//     }
//     await AvalonQuest.update(
//         { active, questResult: questResult || '' },
//         {
//             where: {
//                 roomCode,
//                 questNumber,
//             },
//         },
//     );
// };
// UTILS
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
                side: rolesForPlayers[i].side,
                isCurrentLeader: i === firstLeaderOrderNumber,
                order: i,
            },
        });
    });
    await Promise.all(updateArray);
};
exports.assignRoles = assignRoles;
const switchToNextLeader = async (roomCode) => {
    const players = await (0, exports.getPlayerList)(roomCode);
    // await updateAllPlayers(roomCode, { nominated: false });
    const currentLeader = players.find((player) => player.isCurrentLeader);
    if (currentLeader) {
        const newLeaderOrder = currentLeader.order + 1;
        console.log('newLeaderOrder', newLeaderOrder);
        const newLeader = players.find((player) => {
            if (newLeaderOrder >= players.length) {
                return player.order === 1;
            }
            return player.order === newLeaderOrder;
        });
        currentLeader.isCurrentLeader = false;
        await currentLeader.save();
        if (newLeader) {
            newLeader.isCurrentLeader = true;
            await newLeader.save();
            return newLeader.socketId;
        }
    }
    return '';
};
exports.switchToNextLeader = switchToNextLeader;
const handleGlobalVote = async (roomCode) => {
    const players = await (0, exports.getPlayerList)(roomCode);
    const playerCount = players.length;
    const votedPlayers = players.filter((player) => !!player.globalVote);
    const roomState = await (0, exports.getRoom)(roomCode);
    console.log(playerCount, votedPlayers.length, 'COUNTS');
    if (votedPlayers.length === playerCount) {
        console.log('all players voted');
        const votedInFavor = players.filter((player) => player.globalVote === 'yes');
        if (votedInFavor.length > votedPlayers.length / 2) {
            console.log('global vote success');
            await (0, exports.updateRoom)(roomCode, {
                globalVoteInProgress: false,
                questVoteInProgress: true,
                revealVotes: true,
                missedTeamVotes: 1,
                // currentQuest: roomState?.currentQuest! + 1,
            });
        }
        else {
            console.log('global vote fail');
            const newLeaderId = await (0, exports.switchToNextLeader)(roomCode);
            await (0, exports.updateRoom)(roomCode, {
                globalVoteInProgress: false,
                questVoteInProgress: false,
                nominationInProgress: true,
                revealVotes: true,
                missedTeamVotes: roomState?.missedTeamVotes + 1,
                // currentQuest: roomState?.currentQuest! + 1,
                currentLeaderId: newLeaderId,
            });
        }
    }
};
exports.handleGlobalVote = handleGlobalVote;
const clearVotes = async (roomCode) => {
    await (0, exports.updateAllPlayers)(roomCode, { globalVote: null, questVote: null });
    // await updateRoom(roomCode, { revealVotes: false });
};
exports.clearVotes = clearVotes;
const startNewVoteCycle = async (roomCode) => {
    await (0, exports.updateAllPlayers)(roomCode, { globalVote: null, questVote: null });
    // await switchToNextLeader(roomCode);
};
exports.startNewVoteCycle = startNewVoteCycle;
const handleQuestVote = async (roomCode) => {
    const players = await (0, exports.getPlayerList)(roomCode);
    const nominatedPlayers = players.filter((player) => player.nominated);
    const nominatedPlayersCount = nominatedPlayers.length;
    const votedPlayers = players.filter((player) => !!player.questVote);
    const roomState = await (0, exports.getRoom)(roomCode);
    const nextQuestNumber = roomState?.currentQuest + 1;
    if (roomState && votedPlayers.length === nominatedPlayersCount) {
        const votedInFavor = players.filter((player) => player.questVote === 'yes');
        const newLeaderId = await (0, exports.switchToNextLeader)(roomCode);
        roomState.questVoteInProgress = false;
        roomState.nominationInProgress = true;
        roomState.revealVotes = false;
        roomState.currentLeaderId = newLeaderId;
        roomState.currentQuestResults = votedPlayers.map((player) => !!player.questVote);
        if (votedInFavor.length > votedPlayers.length / 2) {
            await (0, exports.updateQuestResult)(roomCode, roomState?.currentQuest, 'success');
        }
        else {
            await (0, exports.updateQuestResult)(roomCode, roomState?.currentQuest, 'fail');
        }
        roomState.currentQuest = nextQuestNumber;
        await roomState.save();
        await (0, exports.clearVotes)(roomCode);
        await (0, exports.changeActiveQuest)(roomCode, nextQuestNumber);
    }
};
exports.handleQuestVote = handleQuestVote;
