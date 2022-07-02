import { Sequelize } from 'sequelize/types';

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define('AvalonPlayer', {
        socketId: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Player',
        },
        role: {
            type: DataTypes.STRING,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            // allowNull: false,
        },
        isLeader: {
            type: DataTypes.BOOLEAN,
            // allowNull: false,
        },

        // timestamps: false,
        // options
    });