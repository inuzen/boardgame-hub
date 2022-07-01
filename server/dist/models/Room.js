"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, DataTypes) => sequelize.define('Room', {
    roomId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'temp',
    },
    game: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'avalon',
    },
    // timestamps: false,
    // options
});
