'use client';

import React, { memo, useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ErrorEmailLink } from '@/app/components/ui/error-message/error-email-link';
import { IconLink } from '@tabler/icons-react';
import { useAuth } from '@/lib/store/hooks/auth.hooks';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import { toast } from 'sonner';
import { Field, Form, Formik } from 'formik';
import { InviteUserFormValues, inviteUserValidationSchema } from './add-user-link.validation';

/**
 * Component for adding user from link via email input
 * Opens a popover with email input field
 */
export const AddUserLink: React.FC = memo(() => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { inviteUser } = useAuth();
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const initialValues: InviteUserFormValues = {
    email: '',
    role: '',
  };

  const handleSubmit = async (values: InviteUserFormValues, { resetForm }: any): Promise<void> => {
    try {
      await inviteUser(values.email.trim(), values.role).unwrap();
      toast.success('Invitation email has been sent');
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error || 'Failed to send invitation');
    }
  };

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <IconLink className="mr-2 h-4 w-4" />
          Add user from link
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Formik
          initialValues={initialValues}
          validationSchema={inviteUserValidationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ isSubmitting, errors, touched, values, submitCount, setFieldValue }) => {
            // Показываем ошибку если:
            // 1. Поле было touched (пользователь взаимодействовал с полем)
            // 2. Есть ошибка
            // 3. И либо была попытка submit, либо поле не пустое (чтобы показывать ошибки формата)
            const hasValue = values.email && values.email.trim().length > 0;
            const isRequiredError = errors.email === 'Email is required';
            const shouldShowError = touched.email && errors.email && 
              (submitCount > 0 || (hasValue && !isRequiredError));
            const errorMessage = shouldShowError ? String(errors.email) : null;
            
            return (
            <Form>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Add User from Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter email address and role to send invitation
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email">Email *</Label>
                    <ErrorEmailLink className="text-right">{errorMessage}</ErrorEmailLink>
                  </div>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    maxLength={50}
                    disabled={isSubmitting}
                    className={shouldShowError ? 'border-destructive' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={values.role}
                    onValueChange={(value) => setFieldValue('role', value)}
                    disabled={rolesLoading || isSubmitting}
                  >
                    <SelectTrigger className={touched.role && errors.role ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.role && errors.role && (
                    <div className="text-sm text-destructive">{errors.role}</div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || rolesLoading}>
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </Form>
            );
          }}
        </Formik>
      </PopoverContent>
    </Popover>
  );
});

AddUserLink.displayName = 'AddUserLink';

