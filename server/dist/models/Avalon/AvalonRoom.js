"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../namespaces/avalonNameSpace/types");
exports.default = (sequelize, DataTypes) => sequelize.define('AvalonRoom', {
    roomCode: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    hostSocketId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
    },
    currentQuest: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    // votingArray: {
    //     type: DataTypes.ARRAY(DataTypes.STRING),
    // },
    missedTeamVotes: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
    },
    nominationInProgress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    assassinationInProgress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    globalVoteInProgress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    questVoteInProgress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    gameInProgress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    revealVotes: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    revealRoles: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    currentLeaderId: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    currentQuestResults: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    gameMessage: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    extraRoles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    takenImages: {
        type: DataTypes.JSONB,
        defaultValue: {
            [types_1.AVATARS.BARBARIAN]: { key: types_1.AVATARS.BARBARIAN, taken: false },
            [types_1.AVATARS.BOW]: { key: types_1.AVATARS.BOW, taken: false },
            [types_1.AVATARS.CROSSBOW]: { key: types_1.AVATARS.CROSSBOW, taken: false },
            [types_1.AVATARS.DRAGON]: { key: types_1.AVATARS.DRAGON, taken: false },
            [types_1.AVATARS.DRUID]: { key: types_1.AVATARS.DRUID, taken: false },
            [types_1.AVATARS.KNIGHT]: { key: types_1.AVATARS.KNIGHT, taken: false },
            [types_1.AVATARS.MAGICIAN]: { key: types_1.AVATARS.MAGICIAN, taken: false },
            [types_1.AVATARS.MARTIAL]: { key: types_1.AVATARS.MARTIAL, taken: false },
            [types_1.AVATARS.PRIEST]: { key: types_1.AVATARS.PRIEST, taken: false },
            [types_1.AVATARS.SWORDSMAN]: { key: types_1.AVATARS.SWORDSMAN, taken: false },
        },
    },
    // timestamps: false,
    // options
});
