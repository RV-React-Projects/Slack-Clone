import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

export interface UserState {
  isAuthenticated: boolean;
  loggingOut: boolean;
}

const initialState: UserState = {
  loggingOut: false,
  isAuthenticated: true,
};

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const userSlice = createAppSlice({
  name: 'user',
  initialState,
  reducers: _ => ({
    toggleAuth: state => {
      state.isAuthenticated = !state.isAuthenticated;
    },
    logout: state => {
      state.isAuthenticated = false;
    },
  }),
});

export const { toggleAuth } = userSlice.actions;
export default userSlice.reducer;
