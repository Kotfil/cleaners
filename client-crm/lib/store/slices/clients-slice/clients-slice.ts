import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientsState, PaginatedResponse } from './clients-slice.types';
import { clientsApi } from '../../api/clients.api';

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (
    { page = 1, limit = 10, status }: { page?: number; limit?: number; status?: 'active' | 'suspended' | 'archived' | null } = {}, 
    { rejectWithValue }
  ) => {
    try {
      const response = await clientsApi.getClients(page, limit, status);
      // axios возвращает response.data, который уже содержит { data: Client[], meta: {...} }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch clients');
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData: any, { rejectWithValue }) => {
    try {
      const response = await clientsApi.createClient(clientData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create client');
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, clientData }: { id: string; clientData: any }, { rejectWithValue }) => {
    try {
      const response = await clientsApi.updateClient(id, clientData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update client');
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string, { rejectWithValue }) => {
    try {
      await clientsApi.deleteClient(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete client');
    }
  }
);

export const archiveClient = createAsyncThunk(
  'clients/archiveClient',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await clientsApi.updateClient(id, { status: 'archived', canSignIn: false });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to archive client');
    }
  }
);

export const searchClients = createAsyncThunk(
  'clients/searchClients',
  async ({ query, page = 1, limit = 10 }: { query: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await clientsApi.searchClients(query, page, limit);
      // axios возвращает response.data, который уже содержит { data: Client[], meta: {...} }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search clients');
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<PaginatedResponse<Client>>) => {
        state.loading = false;
        state.clients = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Client
      .addCase(createClient.fulfilled, (state, action: PayloadAction<any>) => {
        state.clients.push(action.payload);
      })
      // Update Client
      .addCase(updateClient.fulfilled, (state, action: PayloadAction<any>) => {
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      // Delete Client
      .addCase(deleteClient.fulfilled, (state, action: PayloadAction<string>) => {
        state.clients = state.clients.filter(client => client.id !== action.payload);
      })
      // Archive Client
      .addCase(archiveClient.fulfilled, (state, action: PayloadAction<any>) => {
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      })
      // Search Clients
      .addCase(searchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchClients.fulfilled, (state, action: PayloadAction<PaginatedResponse<Client>>) => {
        state.loading = false;
        state.clients = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(searchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = clientsSlice.actions;
export default clientsSlice.reducer;
