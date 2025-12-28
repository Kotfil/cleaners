'use client';

import React, { memo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { ErrorEmailLink } from '@/app/components/ui/error-message/error-email-link';
import { IconLink } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Field, Form, Formik } from 'formik';
import { InviteClientFormValues, inviteClientValidationSchema } from './add-client-link.validation';
import { clientsApi } from '@/lib/store/api/clients.api';

/**
 * Component for adding client from link via email input
 * Opens a popover with email input field
 */
export const AddClientLink: React.FC = memo(() => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const initialValues: InviteClientFormValues = {
    email: '',
    role: 'client', // Always 'client' for client invitations
  };

  const handleSubmit = async (values: InviteClientFormValues, { resetForm }: any): Promise<void> => {
    try {
      await clientsApi.inviteClient(values.email.trim(), values.role);
      toast.success('Invitation email has been sent');
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to send invitation');
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
          Add client from link
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Formik
          initialValues={initialValues}
          validationSchema={inviteClientValidationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ isSubmitting, errors, touched, values, submitCount }) => {
            const hasValue = values.email && values.email.trim().length > 0;
            const isRequiredError = errors.email === 'Email is required';
            const shouldShowError = touched.email && errors.email && 
              (submitCount > 0 || (hasValue && !isRequiredError));
            const errorMessage = shouldShowError ? String(errors.email) : null;
            
            return (
            <Form>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Add Client from Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter email address to send invitation to client portal
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
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
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

AddClientLink.displayName = 'AddClientLink';

