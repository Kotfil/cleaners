export interface ClientPhone {
  id: string;
  number: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ClientStatus = 'active' | 'suspended' | 'archived';

export interface Client {
  id: string;
  email?: string;
  name?: string;
  status: ClientStatus;
  canSignIn: boolean;
  phones?: ClientPhone[];
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
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}
