import { apiClient } from './auth.api';

export interface SendSmsRequest {
  to: string;
  text: string;
}

export interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * RingCentral SMS API
 */
export const ringCentralApi = {
  sendSms: (request: SendSmsRequest) =>
    apiClient.post<SendSmsResponse>('/api/ring-central/sms', request),
};

