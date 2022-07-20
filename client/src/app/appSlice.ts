import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from './store';

export interface AppState {
    nickname: string;
    roomCode: string;
    action: 'create' | 'join' | null;
}

const initialState: AppState = {
    nickname: localStorage.getItem('nickname') || '',
    roomCode: '',
    action: null,
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
        setAction: (state, action: PayloadAction<'create' | 'join' | null>) => {
            state.action = action.payload;
        },
    },
});

export const { setNickname, setRoomCode, setAction } = appSlice.actions;

export const selectNickname = (state: RootState) => state.app.nickname || localStorage.getItem('nickname') || '';
export const selectAction = (state: RootState) => state.app.action;

export default appSlice.reducer;
