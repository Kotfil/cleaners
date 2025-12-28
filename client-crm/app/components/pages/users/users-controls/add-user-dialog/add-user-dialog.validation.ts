import * as yup from 'yup';

export interface AddUserFormValues {
  name?: string;
  email: string;
  password?: string;
  phones?: string[]; // Multiple phones (optional for users)
  roles: string[]; // Array of role names (at least one required)
  status: 'active' | 'suspended';
  // Address fields
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export const addUserValidationSchema: yup.ObjectSchema<AddUserFormValues> = yup.object().shape({
  name: yup
    .string()
    .optional()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must not exceed 30 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .when('status', {
      is: 'active',
      then: (schema) => schema.required('Password is required for active users').min(8, 'Password must be at least 8 characters'),
      otherwise: (schema) => schema.optional(),
    }),
  phones: yup
    .array()
    .of(
      yup.string()
        .required()
        .test('phone-format', 'Phone must be +1 and 10 digits', (value) => {
          if (!value) return false;
          // Remove all non-digit characters except +
          const cleaned = value.replace(/[^\d+]/g, '');
          // Must start with +1 and have exactly 12 characters total (+1XXXXXXXXXX)
          return cleaned.startsWith('+1') && cleaned.length === 12;
        })
    )
    .max(10, 'Maximum 10 phone numbers allowed')
    .optional(),
  roles: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one role is required')
    .required('At least one role is required'),
  status: yup
    .string()
    .oneOf(['active', 'suspended'], 'Invalid status')
    .required('Status is required'),
  street: yup.string().optional(),
  apt: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zipCode: yup.string().optional(),
  notes: yup.string().optional(),
});

