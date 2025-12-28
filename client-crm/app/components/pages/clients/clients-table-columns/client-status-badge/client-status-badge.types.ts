import { ClientStatus } from '@/lib/store/slices/clients-slice/clients-slice.types';

export interface ClientStatusBadgeProps {
  status: ClientStatus;
  clientId: string;
  onOpenDrawer?: () => void;
}
