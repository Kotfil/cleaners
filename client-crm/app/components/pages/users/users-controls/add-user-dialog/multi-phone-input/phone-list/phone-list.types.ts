export interface PhoneListProps {
  phones: string[];
  selectedPhone: string | null;
  onPhoneSelect: (phone: string) => void;
  onPhoneRemove: (phone: string) => void;
  disabled?: boolean; // Disable phone selection and removal
}

