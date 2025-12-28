export interface MultiPhoneInputProps {
  phones: string[];
  onPhonesChange: (phones: string[]) => void;
  onPrimaryPhoneChange?: (phone: string | null) => void;
  error?: string;
  excludeUserId?: string; // For editing user - exclude this user from phone check
  disabled?: boolean; // Disable all phone input functionality
}

