import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from './store';

export interface AppState {
    nickname: string;
    roomCode: string;
}

const initialState: AppState = {
    nickname: Math.random().toString(36).substring(2, 4),
    roomCode: '',
};

export const appSlice = createSlice({
    name: 'app',
    initialState,

    reducers: {
        setNickname: (state, action: PayloadAction<string>) => {
            // @ts-ignore
            state.nickname = action.payload;
        },
        setRoomCode: (state, action: PayloadAction<string>) => {
            // @ts-ignore
            state.roomCode = action.payload;
        },
    },
});

export const { setNickname, setRoomCode } = appSlice.actions;

export const selectNickname = (state: RootState) => state.app.nickname;

export default appSlice.reducer;
