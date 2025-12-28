import { User } from '@/lib/store/slices/users-slice/users-slice.types';

export interface UserDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

