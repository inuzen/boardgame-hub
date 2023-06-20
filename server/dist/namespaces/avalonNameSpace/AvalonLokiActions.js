"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNewVoteCycleLoki = exports.assignRolesLoki = exports.updateAllPlayersLoki = exports.getRoomByCode = exports.addRoom = void 0;
const lokiDB_1 = require("../../config/lokiDB");
const engine_1 = require("./engine");
const types_1 = require("./types");
const addRoom = (roomCode) => {
    return lokiDB_1.Avalon.insert({
        roomCode,
        players: [],
        takenImages: Object.keys(types_1.AVATARS).reduce((acc, avatar) => {
            acc[avatar] = { key: avatar, taken: false };
            return acc;
        }, {}),
        currentQuest: null,
        hostSocketId: '',
        currentLeaderId: null,
        extraRoles: [],
        missedTeamVotes: null,
        currentQuestResults: null,
        leaderCanSelectQuest: false,
        gameInProgress: false,
        nominationInProgress: false,
        globalVoteInProgress: false,
        questVoteInProgress: false,
        assassinationInProgress: false,
        gameMessage: '',
        revealVotes: false,
        revealRoles: false,
    });
};
exports.addRoom = addRoom;
const getRoomByCode = (roomCode) => lokiDB_1.Avalon.findOne({ roomCode });
exports.getRoomByCode = getRoomByCode;
const updateAllPlayersLoki = (lokiRoom, updatedProperties) => {
    lokiRoom.players.forEach((player) => {
        player = { ...player, ...updatedProperties };
    });
    lokiDB_1.Avalon.update(lokiRoom);
};
exports.updateAllPlayersLoki = updateAllPlayersLoki;
const assignRolesLoki = (lokiRoom) => {
    const players = lokiRoom.players;
    const playerCount = players.length;
    const firstLeaderOrderNumber = Math.floor(Math.random() * playerCount);
    const rolesForPlayers = (0, engine_1.createRoleDistributionArray)(playerCount, lokiRoom.extraRoles);
    players.forEach((player, i) => {
        player.roleName = rolesForPlayers[i].roleName;
        player.roleKey = rolesForPlayers[i].key;
        player.side = rolesForPlayers[i].side;
        player.isCurrentLeader = i === firstLeaderOrderNumber;
        player.order = i;
        player.roleDescription = rolesForPlayers[i].ability;
    });
    players.forEach((player, i, arr) => {
        player.secretInformation = (0, engine_1.createMessageByRole)(player, arr);
    });
    lokiDB_1.Avalon.update(lokiRoom);
};
exports.assignRolesLoki = assignRolesLoki;
const startNewVoteCycleLoki = (room) => {
    (0, exports.updateAllPlayersLoki)(room, { globalVote: null, questVote: null, nominated: false });
};
exports.startNewVoteCycleLoki = startNewVoteCycleLoki;
