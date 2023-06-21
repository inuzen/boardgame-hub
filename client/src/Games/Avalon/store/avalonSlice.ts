import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store';

import { AvalonRoomServer, ROLE_LIST } from './types';

export interface AvalonPlayer {
    socketId: string;
    roomCode: string;
    name: string;
    roleName: string | null;
    roleKey: ROLE_LIST | null;
    isHost: boolean;
    isCurrentLeader: boolean;
    order: number;
    nominated: boolean;
}

interface ConnectionState {
    isConnected: boolean;
    isEstablishingConnection: boolean;
}

type Vote = 'yes' | 'no' | null;

// TODO split in two types - one common with server and the rest is FE specific
export interface AvalonState extends ConnectionState {
    players: AvalonPlayer[];
    hostSocketId: string;
    socketId: string;
    currentQuest: number;
    currentLeader: string | null;
    nominatedPlayers: string[];
    nominationInProgress: boolean;
    globalVoteInProgress: boolean;
    assassinationInProgress: boolean;
    globalVote: Vote;
    revealVotes: boolean;
    // hasVoted: boolean;
    questVoteInProgress: boolean;
    questVote: Vote;
    extraRoles: ROLE_LIST[];
    missedTeamVotes: number;
    questHistory: boolean[];
    leaderCanSelectQuest: boolean;
    gameInProgress: boolean;
    quests: number[];
    roleInfo: {
        roleName: string;
        roleKey: ROLE_LIST | null;
        side: string;
        description: string;
        secretInfo: string;
    };
    nominated: boolean;
    votedPlayers: string[];
    gameOverInfo: { gameEnded: boolean; goodWon: boolean } | null;
    gameMessage: string;
    revealRoles: boolean;
    assassinTargetId: string | null;
}

const initialState: AvalonState = {
    players: [],
    currentQuest: 1,
    currentLeader: null,
    nominatedPlayers: [],
    extraRoles: [],
    missedTeamVotes: 1,
    quests: [0, 0, 0, 0, 0],
    questHistory: [],
    leaderCanSelectQuest: false,
    gameInProgress: false,
    gameOverInfo: null,
    isEstablishingConnection: false,
    isConnected: false,
    hostSocketId: '',
    socketId: '',
    roleInfo: {
        roleName: '',
        roleKey: null,
        side: '',
        description: '',
        secretInfo: '',
    },
    nominated: false,
    nominationInProgress: false,
    globalVoteInProgress: false,
    globalVote: null,
    questVoteInProgress: false,
    questVote: null,
    revealVotes: false,
    votedPlayers: [],
    gameMessage: '',
    revealRoles: false,
    assassinTargetId: '',
    assassinationInProgress: false,
};

// export const connect = createAsyncThunk('avalon/connect', async () => {
//     return io(`http://${window.location.hostname}:3001/avalon`);

//     // The value we return becomes the `fulfilled` action payload
//     // return response.data;
// });

export const avalonSlice = createSlice({
    name: 'avalon',
    initialState,

    reducers: {
        startConnecting: (state, action: PayloadAction<string>) => {
            state.isEstablishingConnection = true;
        },
        connectionEstablished: (state, action) => {
            state.isConnected = true;
            state.isEstablishingConnection = true;
            state.socketId = action.payload;
        },
        disconnect: (state) => {
            state = { ...initialState };
        },
        receivePlayers: (state, action: PayloadAction<any[]>) => {
            state.players = action.payload.sort((a, b) => a.order - b.order);
        },
        receiveQuests: (state, action: PayloadAction<any[]>) => {
            state.quests = action.payload;
        },
        startGame: (state) => {
            state.gameInProgress = true;
            state.gameOverInfo = null;
            state.votedPlayers = [];
            state.assassinTargetId = null;
        },
        // TODO prevent nomination if quest in progress
        nominatePlayer: (state, action: PayloadAction<string>) => {},
        updateRoom: (state, action: PayloadAction<AvalonRoomServer>) => {
            console.log(action.payload);
            // TODO: UPDATE Types for Loki. Also destructuring might be in order now
            if (action.payload.players) {
                state.players = action.payload.players.sort((a, b) => a.order - b.order);
                state.nominated = action.payload.players?.some(
                    (player) => player.nominated && player.socketId === state.socketId,
                );
            }
            state.gameInProgress = action.payload.gameInProgress;
            state.currentQuest = action.payload.currentQuest;
            state.missedTeamVotes = action.payload.missedTeamVotes;
            state.nominationInProgress = action.payload.nominationInProgress;
            state.globalVoteInProgress = action.payload.globalVoteInProgress;
            state.questVoteInProgress = action.payload.questVoteInProgress;
            state.assassinationInProgress = action.payload.assassinationInProgress;
            state.revealRoles = action.payload.revealRoles;
            state.extraRoles = action.payload.extraRoles;
            state.currentLeader = action.payload.currentLeaderId;

            if (state.revealVotes !== action.payload.revealVotes) {
                state.votedPlayers = [];
                state.revealVotes = action.payload.revealVotes;
            }
            state.gameMessage = action.payload.gameMessage;

            if (action.payload.quests) {
                // @ts-ignore
                state.quests = action.payload.quests.sort((a, b) => a.questNumber - b.questNumber);
            }
        },
        globalVote: (state, action: PayloadAction<'yes' | 'no'>) => {},
        questVote: (state, action: PayloadAction<'yes' | 'no'>) => {},
        assignRole: (
            state,
            action: PayloadAction<{
                roleName: string;
                roleKey: ROLE_LIST;
                side: string;
                secretInfo: string;
                description: string;
            }>,
        ) => {
            state.roleInfo = action.payload;
        },
        confirmParty: (state) => {
            state.votedPlayers = [];
            // state.globalVoteInProgress = true;
        },
        addPlayerToVotedList: (state, action: PayloadAction<string>) => {
            state.votedPlayers.push(action.payload);
        },
        gameOver: (state, action: PayloadAction<{ gameEnded: boolean; goodWon: boolean }>) => {
            state.gameInProgress = false;
            state.gameOverInfo = action.payload;
        },
        toggleExtraRole: (state, action: PayloadAction<ROLE_LIST>) => {},
        assassinate: (state, action: PayloadAction<string>) => {},
        playerKilled: (state, action: PayloadAction<string>) => {
            state.assassinTargetId = action.payload;
        },
        changePlayerName: (state, action: PayloadAction<string>) => {},
    },
});

export const {
    receivePlayers,
    startConnecting,
    connectionEstablished,
    disconnect,
    receiveQuests,
    startGame,
    nominatePlayer,
    updateRoom,
    assignRole,
    confirmParty,
    addPlayerToVotedList,
    globalVote,
    questVote,
    gameOver,
    toggleExtraRole,
    assassinate,
    playerKilled,
    changePlayerName,
} = avalonSlice.actions;

export const getAllPlayers = (state: RootState) => state.avalon.players;
export const getQuests = (state: RootState) => state.avalon.quests;

export const selectCurrentLeader = (state: RootState) => state.avalon.currentLeader;
export const isCurrentLeader = (state: RootState) => state.avalon.currentLeader === state.avalon.socketId;
export const canNominate = (state: RootState) =>
    state.avalon.currentLeader === state.avalon.socketId && state.avalon.nominationInProgress;

export const selectHost = (state: RootState) => state.avalon.players?.find((player) => player.isHost)?.socketId;
export const isHost = (state: RootState) =>
    state.avalon.players?.find((player) => player.isHost)?.socketId === state.avalon.socketId;

export const selectMissedVotes = (state: RootState) => state.avalon.missedTeamVotes;

export const selectRoleInfo = (state: RootState) => state.avalon.roleInfo;

export const shouldShowVoteButtons = (state: RootState) =>
    (state.avalon.globalVoteInProgress || (state.avalon.questVoteInProgress && state.avalon.nominated)) &&
    !state.avalon.votedPlayers.includes(state.avalon.socketId);

export const selectTarget = (state: RootState) => state.avalon.assassinTargetId;
export const canKill = (state: RootState) =>
    state.avalon.roleInfo.roleKey === ROLE_LIST.ASSASSIN &&
    state.avalon.assassinationInProgress &&
    state.avalon.gameInProgress;

export default avalonSlice.reducer;
