import { Sequelize } from 'sequelize/types';

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define('AvalonGame', {
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
