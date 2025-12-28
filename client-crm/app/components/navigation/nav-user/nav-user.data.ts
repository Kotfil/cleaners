import {
  IconCreditCard,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"
import { NavUserMenuItem } from "./nav-user-list-types"

/**
 * Menu items for NavUser component
 */
export const navUserMenuItems: NavUserMenuItem[] = [
  {
    id: 'account',
    label: 'Account',
    icon: IconUserCircle,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: IconCreditCard,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: IconNotification,
  },
];
