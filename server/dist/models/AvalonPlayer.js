"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, DataTypes) => sequelize.define('AvalonPlayer', {
    playerUUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    socketId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
    },
    roomCode: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Player',
    },
    roleName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    roleKey: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    side: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    isHost: {
        type: DataTypes.BOOLEAN,
        // allowNull: false,
    },
    isCurrentLeader: {
        type: DataTypes.BOOLEAN,
        // allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    nominated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    globalVote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    questVote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    secretInformation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    connected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // hasVoted: {
    //     type: DataTypes.BOOLEAN,
    //     defaultValue: false,
    // },
    // timestamps: false,
    // options
});
