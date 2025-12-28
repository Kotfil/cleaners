import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role, RoleCounts, RolesState, CreateRoleRequest, UpdateRoleRequest, AssignPermissionsRequest } from './roles-slice.types';
import { rolesApi } from '../../api/roles.api';

const initialState: RolesState = {
  roles: [],
  counts: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRoles();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch roles');
    }
  }
);

export const fetchRoleCounts = createAsyncThunk(
  'roles/fetchRoleCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRoleCounts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch role counts');
    }
  }
);

export const fetchRole = createAsyncThunk(
  'roles/fetchRole',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await rolesApi.getRole(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch role');
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: CreateRoleRequest, { rejectWithValue }) => {
    try {
      const response = await rolesApi.createRole(roleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, roleData }: { id: string; roleData: UpdateRoleRequest }, { rejectWithValue }) => {
    try {
      const response = await rolesApi.updateRole(id, roleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (id: string, { rejectWithValue }) => {
    try {
      await rolesApi.deleteRole(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete role');
    }
  }
);

export const assignPermissions = createAsyncThunk(
  'roles/assignPermissions',
  async ({ id, permissionsData }: { id: string; permissionsData: AssignPermissionsRequest }, { rejectWithValue }) => {
    try {
      await rolesApi.assignPermissions(id, permissionsData);
      return { id, permissionsData };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to assign permissions');
    }
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Role Counts
      .addCase(fetchRoleCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleCounts.fulfilled, (state, action: PayloadAction<RoleCounts>) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(fetchRoleCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Role
      .addCase(fetchRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false;
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        } else {
          state.roles.push(action.payload);
        }
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false;
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.roles = state.roles.filter(role => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Assign Permissions
      .addCase(assignPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignPermissions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = rolesSlice.actions;
export default rolesSlice.reducer;
