import * as Yup from 'yup';
import { EMAIL_REGEX } from '@/app/components/auth/validation.constants';

export const forgotFormValidationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email format')
        .matches(EMAIL_REGEX, 'Invalid email format')
        .required(' '),
});

