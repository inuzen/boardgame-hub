import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from './store';

export interface AppState {
    nickname: string;
}

const initialState: AppState = {
    nickname: '',
};

export const appSlice = createSlice({
    name: 'app',
    initialState,

    reducers: {
        setNickname: (state, action: PayloadAction<string>) => {
            // @ts-ignore
            state.nickname = action.payload;
        },
    },
});

export const { setNickname } = appSlice.actions;

export const selectNickname = (state: RootState) => state.app.nickname;

export default appSlice.reducer;
