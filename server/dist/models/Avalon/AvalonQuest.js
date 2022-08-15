"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, DataTypes) => sequelize.define('AvalonQuest', {
    roomCode: {
        type: DataTypes.STRING,
    },
    questNumber: {
        type: DataTypes.INTEGER,
    },
    questResult: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    questPartySize: {
        type: DataTypes.INTEGER,
        defaultValue: null,
    },
    // timestamps: false,
    // options
});
