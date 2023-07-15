import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserServerResponse } from './appTypes';

import { RootState } from './store';

type Notification = { error: boolean; text: string } | null;
export interface AppState {
    nickname: string;
    roomCode: string;
    action: 'create' | 'join' | 'join viewer' | null;
    selectedGame: string | null;
    isEstablishingConnection: boolean;
    isConnected: boolean;
    loading: boolean;
    notification: Notification;
}

const initialState: AppState = {
    nickname: localStorage.getItem('nickname') || '',
    roomCode: '',
    selectedGame: null,
    action: null,
    isEstablishingConnection: false,
    isConnected: false,
    notification: null,
    loading: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,

    reducers: {
        setNickname: (state, action: PayloadAction<string>) => {
            localStorage.setItem('nickname', action.payload);
            state.nickname = action.payload;
        },
        setRoomCode: (state, action: PayloadAction<string>) => {
            state.roomCode = action.payload;
        },
        setAction: (state, action: PayloadAction<'create' | 'join' | 'join viewer' | null>) => {
            state.action = action.payload;
        },
        setGame: (state, action: PayloadAction<string | null>) => {
            state.selectedGame = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        createGameRoom: (state, action: PayloadAction<'player' | 'screen'>) => {},
        setNotification: (state, action: PayloadAction<Notification>) => {
            state.notification = action.payload;
        },
    },
});

export const { setNickname, setRoomCode, setAction, setGame, createGameRoom, setNotification, setLoading } =
    appSlice.actions;

export const selectNickname = (state: RootState) => state.app.nickname || localStorage.getItem('nickname') || '';
export const selectAction = (state: RootState) => state.app.action;
export const selectGame = (state: RootState) => state.app.selectedGame;
export const selectRoomCode = (state: RootState) => state.app.roomCode;
export const selectNotification = (state: RootState) => state.app.notification;
export const selectLoading = (state: RootState) => state.app.loading;

export default appSlice.reducer;
