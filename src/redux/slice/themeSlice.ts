import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeTypes = 'light' | 'dark';

interface ThemeState {
  isDark: boolean;
  theme: ThemeTypes;
}

const initialState: ThemeState = {
  isDark: false,
  theme: 'light',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeTypes>) => {
      state.theme = action.payload;
      state.isDark = action.payload === 'dark';
    },
    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      state.isDark = state.theme === 'dark';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
