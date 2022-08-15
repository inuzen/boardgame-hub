import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserServerResponse } from './appTypes';

import { RootState } from './store';

export interface AppState {
    nickname: string;
    roomCode: string;
    action: 'create' | 'join' | null;
    selectedGame: string | null;
    isEstablishingConnection: boolean;
    isConnected: boolean;
}

const initialState: AppState = {
    nickname: localStorage.getItem('nickname') || '',
    roomCode: '',
    selectedGame: null,
    action: null,
    isEstablishingConnection: false,
    isConnected: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,

    reducers: {
        startConnecting: (state) => {
            state.isEstablishingConnection = true;
        },
        connectionEstablished: (state, action) => {
            state.isConnected = true;
            state.isEstablishingConnection = true;
        },
        disconnect: (state) => {
            state = { ...initialState };
        },
        userReceived: (state, action: PayloadAction<UserServerResponse>) => {
            localStorage.set('playerUUID', action.payload.uuid);
            state.nickname = action.payload.nickname || '';
        },
        setNickname: (state, action: PayloadAction<string>) => {
            localStorage.setItem('nickname', action.payload);
            state.nickname = action.payload;
        },
        setRoomCode: (state, action: PayloadAction<string>) => {
            state.roomCode = action.payload;
        },
        setAction: (state, action: PayloadAction<'create' | 'join' | null>) => {
            state.action = action.payload;
        },
        setGame: (state, action: PayloadAction<string | null>) => {
            state.selectedGame = action.payload;
        },
        createGameRoom: (state, action: PayloadAction<'player' | 'screen'>) => {},
    },
});

export const {
    setNickname,
    setRoomCode,
    setAction,
    setGame,
    createGameRoom,
    startConnecting,
    connectionEstablished,
    disconnect,
    userReceived,
} = appSlice.actions;

export const selectNickname = (state: RootState) => state.app.nickname || localStorage.getItem('nickname') || '';
export const selectAction = (state: RootState) => state.app.action;
export const selectGame = (state: RootState) => state.app.selectedGame;
export const selectRoomCode = (state: RootState) => state.app.roomCode;

export default appSlice.reducer;
