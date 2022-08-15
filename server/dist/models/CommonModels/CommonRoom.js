"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, DataTypes) => sequelize.define('Room', {
    roomCode: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    gameName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // timestamps: false,
    // options
});
