import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, SignInRequest, SignInResponse, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest, SignUpRequest, SignUpWithTokenRequest, InviteUserRequest, User } from './auth-slice.types';
import { authApi } from '../../api/auth.api';

// Инициализация токена из localStorage при загрузке приложения
const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  accessToken: getInitialToken(),
  refreshToken: null,
  isAuthenticated: false, // Не устанавливаем в true без проверки через getProfile
  isLoading: false,
  error: null,
};

// Async thunks
export const signIn = createAsyncThunk<SignInResponse, SignInRequest>(
  'auth/signIn',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.signIn(credentials);
      return response.data;
    } catch (error: any) {
      // Возвращаем весь объект данных ошибки, если он содержит информацию о капче
      const errorData = error.response?.data;
      if (errorData && (typeof errorData === 'object' || typeof errorData === 'string')) {
        return rejectWithValue(errorData);
      }
      return rejectWithValue(error.response?.data?.message || 'Sign in failed');
    }
  }
);

export const signUp = createAsyncThunk<void, SignUpRequest>(
  'auth/signUp',
  async (userData, { rejectWithValue }) => {
    try {
      await authApi.signUp(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sign up failed');
    }
  }
);

export const refreshTokens = createAsyncThunk<SignInResponse, RefreshTokenRequest>(
  'auth/refreshTokens',
  async (tokenData, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshTokens(tokenData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getProfile = createAsyncThunk<any, void>(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Get profile failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<void, ForgotPasswordRequest>(
  'auth/forgotPassword',
  async (request, { rejectWithValue }) => {
    try {
      await authApi.forgotPassword(request.email);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Forgot password failed');
    }
  }
);

export const resetPassword = createAsyncThunk<void, ResetPasswordRequest>(
  'auth/resetPassword',
  async (request, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(request.token, request.password, request.confirmPassword);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Reset password failed');
    }
  }
);

export const signUpWithToken = createAsyncThunk<void, SignUpWithTokenRequest>(
  'auth/signUpWithToken',
  async (request, { rejectWithValue }) => {
    try {
      await authApi.signUpWithToken({
        token: request.token,
        email: request.email,
        name: request.name,
        password: request.password,
        confirmPassword: request.confirmPassword,
        role: request.role,
        phones: request.phones,
      });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sign up failed');
    }
  }
);

export const inviteUser = createAsyncThunk<void, InviteUserRequest>(
  'auth/inviteUser',
  async (request, { rejectWithValue }) => {
    try {
      await authApi.inviteUser(request.email, request.role);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = null; // RefreshToken теперь только в httpOnly cookie
        state.isAuthenticated = true;
        state.error = null;
        
        // Декодируем JWT и извлекаем user с permissions
        if (action.payload.accessToken) {
          try {
            const decoded = JSON.parse(atob(action.payload.accessToken.split('.')[1]));
            state.user = decoded;
          } catch (error) {
            console.error('❌ Failed to decode JWT:', error);
          }
        }
        
        // Сохраняем только accessToken, refreshToken в httpOnly cookie
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Tokens
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = null; // RefreshToken теперь только в httpOnly cookie
        state.isAuthenticated = true;
        state.error = null;
        
        // Декодируем JWT и извлекаем user с permissions
        if (action.payload.accessToken) {
          try {
            const decoded = JSON.parse(atob(action.payload.accessToken.split('.')[1]));
            state.user = decoded;
          } catch (error) {
            console.error('❌ Failed to decode JWT:', error);
          }
        }
        
        // Обновляем только accessToken, refreshToken в httpOnly cookie
        localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        
        // Очищаем только accessToken, refreshToken в httpOnly cookie
        localStorage.removeItem('accessToken');
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        
        // Очищаем только accessToken, refreshToken в httpOnly cookie удаляется сервером
        localStorage.removeItem('accessToken');
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge JWT data with profile data
        state.user = {
          ...state.user,
          ...action.payload,
        } as User;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Invite User
    builder
      .addCase(inviteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setTokens, clearAuth } = authSlice.actions;
export { authSlice };
