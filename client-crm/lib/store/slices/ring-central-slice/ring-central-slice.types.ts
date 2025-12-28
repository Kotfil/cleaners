export interface RingCentralState {
  loading: boolean;
  error: string | null;
  lastMessageId: string | null;
}

export interface SendSmsRequest {
  to: string;
  text: string;
}

export interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

