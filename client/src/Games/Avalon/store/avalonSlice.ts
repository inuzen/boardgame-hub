import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../../app/store';
import { Socket, io } from 'socket.io-client';

export interface AvalonPlayer {
    name: string;
    socketId: string;
    isLeader?: boolean;
    isHost?: boolean;
    currentVote?: boolean;
    nominated?: boolean;
    selected: boolean;
}
export interface AvalonState {
    players: AvalonPlayer[];
    hostSocketId: string;
    socketId: string;
    partySize: number;
    evilScore: number;
    goodScore: number;
    currentQuest: number;
    currentLeader: string | null;
    nominatedPlayers: string[];
    extraRoles: string[];
    missedTeamVotes: number;
    questHistory: boolean[];
    leaderCanSelectQuest: boolean;
    gameInProgress: boolean;
    quests: number[];
    isEstablishingConnection: boolean;
    isConnected: boolean;
    role: string;
}

const initialState: AvalonState = {
    players: [],
    partySize: 0,
    evilScore: 0,
    goodScore: 0,
    currentQuest: 1,
    currentLeader: null,
    nominatedPlayers: [],
    extraRoles: [],
    missedTeamVotes: 1,
    quests: [0, 0, 0, 0, 0],
    questHistory: [],
    leaderCanSelectQuest: false,
    gameInProgress: false,
    isEstablishingConnection: false,
    isConnected: false,
    hostSocketId: '',
    socketId: '',
    role: '',
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
        connectionEstablished: (state) => {
            state.isConnected = true;
            state.isEstablishingConnection = true;
        },
        disconnect: (state) => {
            state.isConnected = false;
            state.isEstablishingConnection = false;
        },
        receivePlayers: (state, action: PayloadAction<any[]>) => {
            state.players = action.payload;
        },
        receiveQuests: (state, action: PayloadAction<any[]>) => {
            state.quests = action.payload;
        },
        startGame: (state) => {
            state.gameInProgress = true;
        },
    },
    // extraReducers: (builder) => {
    //     builder.addCase(connect.fulfilled, (state, action) => {
    //         state.socket = action.payload;
    //     });
    // },
});

export const { receivePlayers, startConnecting, connectionEstablished, disconnect, receiveQuests, startGame } =
    avalonSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const getAllPlayers = (state: RootState) => state.avalon.players;
export const getQuests = (state: RootState) => state.avalon.quests;
export const isCurrentLeader = (state: RootState) => state.avalon.currentLeader === state.avalon.socketId;
export const isHost = (state: RootState) => state.avalon.hostSocketId === state.avalon.socketId;

export default avalonSlice.reducer;
