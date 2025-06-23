import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import themeReducer from '@slice/themeSlice';
import userReducer from '@slice/userSlice';

const __DEV__ = process.env.NODE_ENV !== 'production';

const rootReducer = combineReducers({
  theme: themeReducer,
  user: userReducer,
});

// Configure Store
export const store = configureStore({
  reducer: rootReducer,
  devTools: __DEV__,
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
