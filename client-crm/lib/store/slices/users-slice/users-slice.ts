import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UsersState, PaginatedResponse } from './users-slice.types';
import { usersApi } from '../../api/users.api';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  pagination: null,
};

// Утилитарная функция для нормализации пользователей
const normalizeUsers = (users: User[] | undefined | null): User[] => {
  if (!users || !Array.isArray(users)) {
    return [];
  }
  return users.map(user => ({
    ...user,
    role: user.role || {
      id: 'default-role',
      name: 'user',
      description: 'Default User Role',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // secondaryRoles может быть null/undefined/пустым массивом - это нормально
    secondaryRoles: user.secondaryRoles || []
  }));
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (
    { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, status }: { page?: number; limit?: number; status?: 'active' | 'suspended' | 'archived' | null } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await usersApi.getUsers(page, limit, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await usersApi.createUser(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: any }, { rejectWithValue }) => {
    try {
      const response = await usersApi.updateUser(id, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update user');
    }
  }
);

export const archiveUser = createAsyncThunk(
  'users/archiveUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersApi.updateUser(id, { id, status: 'archived' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to archive user');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (
    { query, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: { query: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await usersApi.searchUsers(query, page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search users');
    }
  }
);

export const getUsersByRole = createAsyncThunk(
  'users/getUsersByRole',
  async (role: string, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUsersByRole(role);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch users by role');
    }
  }
);

export const getActiveUsers = createAsyncThunk(
  'users/getActiveUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersApi.getActiveUsers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch active users');
    }
  }
);

export const checkPhoneExists = createAsyncThunk(
  'users/checkPhoneExists',
  async (
    { phoneNumber, excludeUserId }: { phoneNumber: string; excludeUserId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await usersApi.checkPhoneExists(phoneNumber, excludeUserId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to check phone number');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedResponse<User>>) => {
        state.loading = false;
        const normalizedUsers = normalizeUsers(action.payload.data);
        state.users = normalizedUsers;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.pagination = null;
      })
      // Create User
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        const [normalizedUser] = normalizeUsers([action.payload]);
        state.users.unshift(normalizedUser);
        if (state.pagination) {
          state.pagination.total += 1;
          state.pagination.totalPages = Math.max(
            Math.ceil(state.pagination.total / state.pagination.limit),
            1
          );
        }
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const [normalizedUser] = normalizeUsers([action.payload]);
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = normalizedUser;
        }
      })
      // Archive User
      .addCase(archiveUser.fulfilled, (state, action: PayloadAction<User>) => {
        const [normalizedUser] = normalizeUsers([action.payload]);
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          // Обновляем статус пользователя на archived в списке
          state.users[index] = normalizedUser;
        }
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action: PayloadAction<PaginatedResponse<User>>) => {
        state.loading = false;
        state.users = normalizeUsers(action.payload.data);
        state.pagination = action.payload.meta;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.pagination = null;
      })
      // Get Users by Role
      .addCase(getUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersByRole.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = normalizeUsers(action.payload);
        state.pagination = null;
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Active Users
      .addCase(getActiveUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = normalizeUsers(action.payload);
        state.pagination = null;
      })
      .addCase(getActiveUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
