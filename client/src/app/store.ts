import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import avalonMiddleware from '../Games/Avalon/store/avalonMiddleware';
import avalonReducer from '../Games/Avalon/store/avalonSlice';
// import appMiddleware from './appMiddleware';
import appReducer from './appSlice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        avalon: avalonReducer,
    },
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware().concat(avalonMiddleware);
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
