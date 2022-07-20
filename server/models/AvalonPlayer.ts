import { ROLE_LIST } from './../namespaces/types';
import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';
import { SIDES } from '../namespaces/types';

type VoteType = 'yes' | 'no';
export interface AvalonPlayerType {
    playerUUID?: string;
    order: number;
    roomCode: string;
    name: string;
    socketId: string;
    roleName: string | null;
    roleKey: ROLE_LIST | null;
    isCurrentLeader?: boolean;
    isHost: boolean;
    globalVote: VoteType | null;
    questVote: VoteType | null;
    nominated?: boolean;
    side?: SIDES | null;
    secretInformation?: string | null;
    connected?: boolean;
}

export interface AvalonPlayerModel
    extends AvalonPlayerType,
        Model<InferAttributes<AvalonPlayerModel>, InferCreationAttributes<AvalonPlayerModel>> {}

export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define<AvalonPlayerModel>('AvalonPlayer', {
        playerUUID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
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
        roleName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        roleKey: {
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
        secretInformation: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        connected: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // hasVoted: {
        //     type: DataTypes.BOOLEAN,
        //     defaultValue: false,
        // },
        // timestamps: false,
        // options
    });
