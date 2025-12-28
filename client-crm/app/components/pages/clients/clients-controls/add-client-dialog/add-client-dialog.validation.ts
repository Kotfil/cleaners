import * as yup from 'yup';

export interface AddClientFormValues {
  name?: string;
  email?: string;
  phones?: string[];
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export const addClientValidationSchema: yup.ObjectSchema<AddClientFormValues> = yup.object().shape({
  name: yup
    .string()
    .optional()
    .min(2, 'Name must be at least 2 characters')
    .max(70, 'Name must not exceed 70 characters'),
  email: yup
    .string()
    .optional()
    .test('email-format', 'Invalid email format', (value) => {
      if (!value || value.length === 0) return true;
      return yup.string().email().isValidSync(value);
    })
    .max(80, 'Email must not exceed 80 characters'),
  phones: yup
    .array()
    .of(
      yup
        .string()
        .required()
        .test('phone-format', 'Phone must be +1 and 10 digits', (value) => {
          if (!value) return false;
          // Remove all non-digit characters except +
          const cleaned = value.replace(/[^\d+]/g, '');
          // Must start with +1 and have exactly 12 characters total (+1XXXXXXXXXX)
          return cleaned.startsWith('+1') && cleaned.length === 12;
        })
    )
    .optional()
    .max(10, 'Maximum 10 phone numbers allowed'),
  street: yup
    .string()
    .optional(),
  apt: yup
    .string()
    .optional(),
  city: yup
    .string()
    .optional(),
  state: yup
    .string()
    .optional(),
  zipCode: yup
    .string()
    .optional(),
  notes: yup
    .string()
    .optional()
    .max(300, 'Notes must not exceed 300 characters'),
});

