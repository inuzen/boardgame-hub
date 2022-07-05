import { Sequelize } from 'sequelize/types';

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define('AvalonRoom', {
        roomCode: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        currentRound: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        votingArray: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        missedTeamVotes: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        nominationInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        votingInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        currentLeaderId: {
            type: DataTypes.STRING,
            defaultValue: '',
        },

        // timestamps: false,
        // options
    });
