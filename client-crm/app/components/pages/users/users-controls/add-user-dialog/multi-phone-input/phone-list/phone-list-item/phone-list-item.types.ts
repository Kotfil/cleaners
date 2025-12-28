export interface PhoneListItemProps {
  phone: string;
  isSelected: boolean;
  onSelect: (phone: string) => void;
  onRemove: (phone: string) => void;
  disabled?: boolean; // Disable phone selection and removal
}

