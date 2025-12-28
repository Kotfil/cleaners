import { User } from '@/lib/store/slices/users-slice/users-slice.types';

export interface UserActionsCellProps {
  user: User;
  onOpenDrawer?: () => void;
}

