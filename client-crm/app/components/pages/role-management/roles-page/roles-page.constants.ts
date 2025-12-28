import {
  Shield,
  Briefcase,
  Scale,
  Calculator,
  Sparkles,
  User,
} from 'lucide-react';



// Маппинг иконок для ролей
export const ROLE_ICONS = {
  admin: Shield,
  manager: Briefcase,
  lawyer: Scale,
  accountant: Calculator,
  cleaner: Sparkles,
  default: User,
} as const;



export const getRoleIcon = (roleName: string) => {
  const normalizedName = roleName.toLowerCase();
  return ROLE_ICONS[normalizedName as keyof typeof ROLE_ICONS] || ROLE_ICONS.default;
};

