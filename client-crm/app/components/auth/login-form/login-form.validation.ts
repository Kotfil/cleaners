import * as Yup from 'yup';
import { 
    EMAIL_REGEX, 
    PASSWORD_MIN_LENGTH, 
    PASSWORD_UPPERCASE_REGEX, 
    PASSWORD_SPECIAL_CHAR_REGEX 
} from '@/app/components/auth/validation.constants';

export const loginFormValidationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email format')
        .matches(EMAIL_REGEX, 'Invalid email format')
        .required(' '),
    password: Yup.string()
        .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        .matches(PASSWORD_UPPERCASE_REGEX, 'Password must contain at least 1 uppercase letter')
        .matches(PASSWORD_SPECIAL_CHAR_REGEX, 'Password must contain at least 1 special character')
        .required(' '),
});
