import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Permission, PermissionsState } from './permissions-slice.types';
import { permissionsApi } from '../../api/permissions.api';

const initialState: PermissionsState = {
  permissions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await permissionsApi.getAllPermissions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch permissions');
    }
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = permissionsSlice.actions;
export default permissionsSlice.reducer;

