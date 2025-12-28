import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiState, PasswordRequirementsState } from './api-slice.types';
import { authApi } from '../../api/auth.api';
import { PasswordRequirementsResponse } from '../../types/auth.types';

const initialState: ApiState = {
  isLoading: false,
  error: null,
  passwordRequirements: null,
};

// Async thunk to fetch password requirements from server
export const fetchPasswordRequirements = createAsyncThunk(
  'api/fetchPasswordRequirements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getPasswordRequirements();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch password requirements');
    }
  }
);

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch password requirements
      .addCase(fetchPasswordRequirements.pending, (state) => {
        if (!state.passwordRequirements) {
          state.passwordRequirements = {
            minLength: 6,
            maxLength: 25,
            requireUppercase: true,
            requireLowercase: false,
            requireNumber: false,
            requireSpecialChar: true,
            specialChars: '!@#$%^&*()_+-=[]{};\':"|,.<>/?',
            isLoading: true,
            error: null,
          };
        } else {
          state.passwordRequirements.isLoading = true;
          state.passwordRequirements.error = null;
        }
      })
      .addCase(fetchPasswordRequirements.fulfilled, (state, action) => {
        const data = action.payload as PasswordRequirementsResponse;
        state.passwordRequirements = {
          ...data,
          isLoading: false,
          error: null,
        };
      })
      .addCase(fetchPasswordRequirements.rejected, (state, action) => {
        // Keep default values if server fails but mark as loaded to avoid infinite retries
        if (!state.passwordRequirements) {
          state.passwordRequirements = {
            minLength: 6,
            maxLength: 25,
            requireUppercase: true,
            requireLowercase: false,
            requireNumber: false,
            requireSpecialChar: true,
            specialChars: '!@#$%^&*()_+-=[]{};\':"|,.<>/?',
            isLoading: false,
            error: action.payload as string,
          };
        } else {
          state.passwordRequirements.isLoading = false;
          state.passwordRequirements.error = action.payload as string;
        }
      });
  },
});

export const { setLoading, setError, clearError } = apiSlice.actions;
export { apiSlice };
