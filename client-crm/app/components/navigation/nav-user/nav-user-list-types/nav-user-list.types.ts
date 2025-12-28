/**
 * Types for NavUserList component
 */

export interface NavUserMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

export interface NavUserListProps {
  items: NavUserMenuItem[];
}
