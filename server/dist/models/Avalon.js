'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = (sequelize, DataTypes) =>
    sequelize.define('Avalon', {
        currentQuest: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        votingArray: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        // timestamps: false,
        // options
    });
