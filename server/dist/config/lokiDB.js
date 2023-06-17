"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLoki = exports.Avalon = exports.db = void 0;
const lokijs_1 = __importDefault(require("lokijs"));
const db = new lokijs_1.default('BoardgameHub');
exports.db = db;
const Avalon = db.addCollection('rooms', {
    indices: ['roomCode', 'players', 'takenImages'],
    unique: ['roomCode'],
    autoupdate: true,
    disableMeta: true,
    clone: true,
    // schema: {
    //     type: 'object',
    //     properties: {
    //         roomCode: { type: 'string', primary: true },
    //         players: {
    //             type: 'array',
    //             items: {
    //                 type: 'object',
    //                 properties: {
    //                     playerUUID: { type: 'string' },
    //                     order: { type: 'number' },
    //                     roomCode: { type: 'string' },
    //                     name: { type: 'string' },
    //                     socketId: { type: 'string' },
    //                     roleName: { type: 'string' },
    //                     roleDescription: { type: 'string' },
    //                     roleKey: { type: 'string' },
    //                     isCurrentLeader: { type: 'boolean' },
    //                     isHost: { type: 'boolean' },
    //                     globalVote: { type: 'string' },
    //                     questVote: { type: 'string' },
    //                     nominated: { type: 'boolean' },
    //                     side: { type: 'string' },
    //                     secretInformation: { type: 'string' },
    //                     connected: { type: 'boolean' },
    //                     imageName: { type: 'string' },
    //                 },
    //             },
    //         },
    //         currentQuest: { type: 'number' },
    //         hostSocketId: { type: 'string' },
    //         currentLeaderId: { type: 'string' },
    //         extraRoles: { type: 'array', items: { type: 'string' } },
    //         missedTeamVotes: { type: 'number' },
    //         currentQuestResults: { type: 'array', items: { type: 'boolean' } },
    //         leaderCanSelectQuest: { type: 'boolean' },
    //         gameInProgress: { type: 'boolean' },
    //         nominationInProgress: { type: 'boolean' },
    //         globalVoteInProgress: { type: 'boolean' },
    //         questVoteInProgress: { type: 'boolean' },
    //         assassinationInProgress: { type: 'boolean' },
    //         gameMessage: { type: 'string' },
    //         revealVotes: { type: 'boolean' },
    //         revealRoles: { type: 'boolean' },
    //         takenImages: { type: 'object' },
    //     },
    // },
});
exports.Avalon = Avalon;
const initLoki = () => {
    console.log('loki init');
};
exports.initLoki = initLoki;
