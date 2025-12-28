import * as yup from 'yup';

export interface InviteClientFormValues {
  email: string;
  role: string;
}

export const inviteClientValidationSchema: yup.ObjectSchema<InviteClientFormValues> = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['client'], 'Role must be "client"'),
});

