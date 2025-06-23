import { createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
}

export const fetchUser = createAsyncThunk<User>('fetchUser', async (__, {}) => {
  return { id: 'user', name: 'user' };
});
export const fetchToken = createAsyncThunk<User>(
  'fetchToken',
  async (__, {}) => {
    return { id: 'user', name: 'user' };
  },
);
