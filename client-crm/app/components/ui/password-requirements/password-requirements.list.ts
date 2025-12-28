import { PASSWORD_MIN_LENGTH } from '@/app/components/auth/validation.constants';

export const PASSWORD_REQUIREMENTS_LIST = [
    { 
        key: 'minLength',
        label: `At least ${PASSWORD_MIN_LENGTH} characters`
    },
    { 
        key: 'uppercase',
        label: '1 uppercase letter'
    },
    { 
        key: 'specialChar',
        label: '1 special character'
    },
] as const;

