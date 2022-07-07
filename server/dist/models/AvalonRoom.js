"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    currentLeaderId: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    currentQuestResults: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    // timestamps: false,
    // options
});
