import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RingCentralState, SendSmsRequest, SendSmsResponse } from './ring-central-slice.types';
import { ringCentralApi } from '../../api/ring-central.api';

const initialState: RingCentralState = {
  loading: false,
  error: null,
  lastMessageId: null,
};

/**
 * Send SMS via RingCentral
 */
export const sendSms = createAsyncThunk(
  'ringCentral/sendSms',
  async (request: SendSmsRequest, { rejectWithValue }) => {
    try {
      // Validate phone number format before sending
      if (!request.to.match(/^\+1\d{10}$/)) {
        return rejectWithValue('Phone number must be in format +1XXXXXXXXXX (10 digits after +1)');
      }
      const response = await ringCentralApi.sendSms(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to send SMS');
    }
  }
);

const ringCentralSlice = createSlice({
  name: 'ringCentral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastMessageId: (state) => {
      state.lastMessageId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendSms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendSms.fulfilled, (state, action: PayloadAction<SendSmsResponse>) => {
        state.loading = false;
        if (action.payload.success) {
          state.lastMessageId = action.payload.messageId || null;
        } else {
          state.error = action.payload.error || 'Failed to send SMS';
        }
      })
      .addCase(sendSms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLastMessageId } = ringCentralSlice.actions;
export default ringCentralSlice.reducer;

