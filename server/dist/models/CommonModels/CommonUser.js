"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, DataTypes) => sequelize.define('User', {
    uuid: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isBigPicture: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // timestamps: false,
    // options
});
