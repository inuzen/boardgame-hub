import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';

interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    uuid: string;
    isBigPicture: boolean;
    nickname?: string | null;
}

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define<UserModel>('User', {
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
