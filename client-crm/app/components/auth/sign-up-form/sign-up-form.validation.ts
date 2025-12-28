import * as Yup from 'yup';
import { EMAIL_REGEX } from '@/app/components/auth/validation.constants';
import { getPasswordValidationSchema } from '@/lib/store/utils/password-validation.utils';

export const getSignUpFormValidationSchema = () => Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .matches(EMAIL_REGEX, 'Invalid email address')
    .required('Email is required'),
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must not exceed 30 characters')
    .optional(),
  password: getPasswordValidationSchema('password'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required(' '),
  phones: Yup.array()
    .of(
      Yup.string().test('phone-format', 'Phone must be +1 and 10 digits', (value) => {
        if (!value) return false;
        // Remove all non-digit characters except +
        const cleaned = value.replace(/[^\d+]/g, '');
        // Must start with +1 and have exactly 12 characters total (+1XXXXXXXXXX)
        return cleaned.startsWith('+1') && cleaned.length === 12;
      })
    )
    .max(10, 'Maximum 10 phone numbers allowed')
    .optional(),
});

