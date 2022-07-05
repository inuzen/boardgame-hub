import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';

type VoteType = 'yes' | 'no';
export interface AvalonPlayerType {
    order: number;
    roomCode: string;
    name: string;
    socketId: string;
    role: string;
    isCurrentLeader?: boolean;
    isHost: boolean;
    globalVote: VoteType | null;
    questVote: VoteType | null;
    nominated?: boolean;
}

interface AvalonPlayerModel
    extends AvalonPlayerType,
        Model<InferAttributes<AvalonPlayerModel>, InferCreationAttributes<AvalonPlayerModel>> {}

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define<AvalonPlayerModel>('AvalonPlayer', {
        socketId: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
        },
        roomCode: {
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
        isHost: {
            type: DataTypes.BOOLEAN,
            // allowNull: false,
        },
        isCurrentLeader: {
            type: DataTypes.BOOLEAN,
            // allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        nominated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        globalVote: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        questVote: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        // timestamps: false,
        // options
    });
