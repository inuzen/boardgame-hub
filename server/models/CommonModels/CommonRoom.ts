import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';

interface RoomModel extends Model<InferAttributes<RoomModel>, InferCreationAttributes<RoomModel>> {
    roomCode: string;
    gameName: string;
}

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define<RoomModel>('Room', {
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
