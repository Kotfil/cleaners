import { Client } from '@/lib/store/slices/clients-slice/clients-slice.types';

export interface ClientActionsCellProps {
  client: Client;
  onOpenDrawer?: () => void;
}

