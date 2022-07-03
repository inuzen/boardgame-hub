import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';

interface QuestModel extends Model<InferAttributes<QuestModel>, InferCreationAttributes<QuestModel>> {
    roomCode: string;
    questNumber: number;
    questPartySize: number;
    questResult: 'success' | 'fail' | '';
    active: boolean;
}

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define<QuestModel>('AvalonQuest', {
        roomCode: {
            type: DataTypes.STRING,
        },
        questNumber: {
            type: DataTypes.INTEGER,
        },
        questResult: {
            type: DataTypes.STRING,
            defaultValue: '',
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
