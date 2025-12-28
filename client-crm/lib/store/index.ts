import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/auth-slice/auth-slice';
import { apiSlice } from './slices/api-slice/api-slice';
import clientsReducer from './slices/clients-slice/clients-slice';
import usersReducer from './slices/users-slice/users-slice';
import rolesReducer from './slices/roles-slice/roles-slice';
import permissionsReducer from './slices/permissions-slice/permissions-slice';
import ringCentralReducer from './slices/ring-central-slice/ring-central-slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    api: apiSlice.reducer,
    clients: clientsReducer,
    users: usersReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    ringCentral: ringCentralReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
