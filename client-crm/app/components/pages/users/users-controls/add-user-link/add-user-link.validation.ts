import * as yup from 'yup';

export interface InviteUserFormValues {
  email: string;
  role: string;
}

export const inviteUserValidationSchema: yup.ObjectSchema<InviteUserFormValues> = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  role: yup
    .string()
    .required('Role is required'),
});

