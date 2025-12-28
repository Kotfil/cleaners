import { Client } from '../slices/clients-slice/clients-slice.types';

export interface CreateClientRequest {
  email?: string;
  name?: string;
  phones?: Array<{ number: string; isPrimary: boolean }>;
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
  formattedAddress?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  status?: 'active' | 'suspended' | 'archived';
  canSignIn?: boolean;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string;
}

export type ClientsResponse = Client[];

export interface ClientResponse {
  client: Client;
}

export interface SearchClientsRequest {
  query: string;
}

export interface SearchClientsResponse {
  clients: Client[];
}
