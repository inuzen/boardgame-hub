import { InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize/types';
import { AVATARS, ROLE_LIST } from '../namespaces/types';
import { AvalonPlayerType } from './AvalonPlayer';
export interface AvalonRoomType {
    roomCode: string;
    currentQuest?: number;
    hostSocketId: string;
    currentLeaderId?: string | null;
    extraRoles?: ROLE_LIST[];
    missedTeamVotes?: number;
    currentQuestResults?: boolean[];
    leaderCanSelectQuest?: boolean;
    gameInProgress?: boolean;
    nominationInProgress?: boolean;
    globalVoteInProgress?: boolean;
    questVoteInProgress?: boolean;
    assassinationInProgress?: boolean;
    gameMessage?: string;
    revealVotes?: boolean;
    revealRoles?: boolean;
    AvalonPlayers?: AvalonPlayerType[];
    takenImages: Record<AVATARS, { key: AVATARS; taken: boolean }>;
}
interface AvalonRoomModel
    extends AvalonRoomType,
        Model<InferAttributes<AvalonRoomModel>, InferCreationAttributes<AvalonRoomModel>> {}
export default (sequelize: Sequelize, DataTypes: any) =>
    sequelize.define<AvalonRoomModel>('AvalonRoom', {
        roomCode: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        hostSocketId: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
        },
        currentQuest: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        // votingArray: {
        //     type: DataTypes.ARRAY(DataTypes.STRING),
        // },
        missedTeamVotes: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        nominationInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        assassinationInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        globalVoteInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        questVoteInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        gameInProgress: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        revealVotes: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        revealRoles: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        currentLeaderId: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        currentQuestResults: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        gameMessage: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        extraRoles: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        takenImages: {
            type: DataTypes.JSONB,
            defaultValue: {
                [AVATARS.BARBARIAN]: { key: AVATARS.BARBARIAN, taken: false },
                [AVATARS.BOW]: { key: AVATARS.BOW, taken: false },
                [AVATARS.CROSSBOW]: { key: AVATARS.CROSSBOW, taken: false },
                [AVATARS.DRAGON]: { key: AVATARS.DRAGON, taken: false },
                [AVATARS.DRUID]: { key: AVATARS.DRUID, taken: false },
                [AVATARS.KNIGHT]: { key: AVATARS.KNIGHT, taken: false },
                [AVATARS.MAGICIAN]: { key: AVATARS.MAGICIAN, taken: false },
                [AVATARS.MARTIAL]: { key: AVATARS.MARTIAL, taken: false },
                [AVATARS.PRIEST]: { key: AVATARS.PRIEST, taken: false },
                [AVATARS.SWORDSMAN]: { key: AVATARS.SWORDSMAN, taken: false },
            },
        },
        // timestamps: false,
        // options
    });
