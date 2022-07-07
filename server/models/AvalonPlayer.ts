import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';
import { SIDES } from '../namespaces/types';

type VoteType = 'yes' | 'no';
export interface AvalonPlayerType {
    order: number;
    roomCode: string;
    name: string;
    socketId: string;
    role: string | null;
    isCurrentLeader?: boolean;
    isHost: boolean;
    globalVote: VoteType | null;
    questVote: VoteType | null;
    nominated?: boolean;
    side?: SIDES | null;
    // hasVoted?: boolean;
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
            allowNull: true,
            defaultValue: null,
        },
        side: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
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
            defaultValue: 0,
        },
        nominated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        globalVote: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        questVote: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        // hasVoted: {
        //     type: DataTypes.BOOLEAN,
        //     defaultValue: false,
        // },
        // timestamps: false,
        // options
    });
