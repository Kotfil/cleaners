'use client';

import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog';
import { FormikErrorMessageWrapper } from '@/app/components/ui/error-message/formik-error-message';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { MultiRoleSelect } from '@/app/components/ui/multi-role-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { AppDispatch } from '@/lib/store';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import { signUp } from '@/lib/store/slices/auth-slice/auth-slice';
import { fetchUsers } from '@/lib/store/slices/users-slice/users-slice';
import { IconPlus } from '@tabler/icons-react';
import { Field, Form, Formik } from 'formik';
import React, { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { USERS_PAGE_LIMIT } from '../../users.constants';
import { AddUserFormValues, addUserValidationSchema } from './add-user-dialog.validation';
import { PhonePopover } from './phone-popover/phone-popover';
import { US_STATES } from '../../users-table-columns/user-drawer/us-states.constants';
import { cleanPhoneNumber } from '@/app/components/pages/chat/phone-formatter';

export const AddUserDialog: React.FC = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [primaryPhone, setPrimaryPhone] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Set default role to 'cleaner' when roles are loaded
  useEffect(() => {
    if (roles.length > 0 && !roles.find(r => r.name === 'cleaner')) {
      // If cleaner role doesn't exist, use first role
      const defaultRole = roles[0]?.name;
      if (defaultRole) {
        // This will be handled in form initialization
      }
    }
  }, [roles]);

  const initialValues: AddUserFormValues = {
    name: '',
    email: '',
    password: '',
    phones: [],
    roles: [], // Will be set to ['cleaner'] after roles load
    status: 'active',
    street: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  };

  const handleSubmit = async (values: AddUserFormValues, { setSubmitting, resetForm }: any) => {
    try {
      if (!values.roles || values.roles.length === 0) {
        toast.error('At least one role is required');
        return;
      }
      
      // Первая роль - основная, остальные - secondary
      const primaryRole = values.roles[0];
      const secondaryRoles = values.roles.slice(1);
      
      // Автоматически определяем canSignIn на основе статуса
      const canSignIn = values.status === 'active';
      
      // Подготовка телефонов - очищаем форматирование перед отправкой
      const phones = values.phones && values.phones.length > 0
        ? values.phones.map((phone) => {
            const cleanedPhone = cleanPhoneNumber(phone);
            if (!cleanedPhone) {
              throw new Error(`Invalid phone number format: ${phone}`);
            }
            return {
              number: cleanedPhone,
              isPrimary: phone === primaryPhone || (primaryPhone === null && phone === values.phones?.[0]),
            };
          })
        : undefined;
      
      await dispatch(signUp({
        email: values.email.trim(),
        password: canSignIn ? values.password : undefined,
        ...(values.name?.trim() && { name: values.name.trim() }),
        role: primaryRole,
        secondaryRoles: secondaryRoles.length > 0 ? secondaryRoles : undefined,
        phones,
        canSignIn: canSignIn,
        ...(values.street?.trim() && { street: values.street.trim() }),
        ...(values.apt?.trim() && { apt: values.apt.trim() }),
        ...(values.city?.trim() && { city: values.city.trim() }),
        ...(values.state?.trim() && { state: values.state.trim() }),
        ...(values.zipCode?.trim() && { zipCode: values.zipCode.trim() }),
        ...(values.notes?.trim() && { notes: values.notes.trim() }),
      })).unwrap();
      
      toast.success('User created successfully');
      resetForm();
      setFormKey((prev) => prev + 1);
      setIsOpen(false);
      dispatch(fetchUsers({ page: 1, limit: USERS_PAGE_LIMIT }));
    } catch (error: any) {
      toast.error(error || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = useCallback((open: boolean) => {
    try {
      setIsOpen(open);
      if (!open) {
        setFormKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error handling dialog open change:', error);
      // Продолжаем работу даже при ошибке
      setIsOpen(false);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Add User
        </Button> */}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-4">
        <DialogHeader className="pb-3">
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user profile. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        
        <Formik
          key={formKey}
          initialValues={{
            ...initialValues,
            roles: roles.length > 0 
              ? (roles.find(r => r.name === 'cleaner') ? ['cleaner'] : [roles[0].name])
              : [],
          }}
          validationSchema={addUserValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, setFieldValue, values }) => (
            <Form className="flex flex-col overflow-hidden">
              <div className="grid gap-4 overflow-y-auto pl-1 pr-2 flex-1">
                {/* Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Enter full name"
                      maxLength={30}
                      className={touched.name && errors.name ? 'border-destructive' : ''}
                    />
                    <div className="min-h-[20px]">
                      <FormikErrorMessageWrapper name="name" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      className={touched.email && errors.email ? 'border-destructive' : ''}
                    />
                    <div className="min-h-[20px]">
                      <FormikErrorMessageWrapper name="email" />
                    </div>
                  </div>
                </div>

                {/* Phones */}
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Field name="phones">
                    {({ field, form }: any) => (
                      <PhonePopover
                        phones={field.value || []}
                        onPhonesChange={(phones: string[]) => form.setFieldValue('phones', phones)}
                        onPrimaryPhoneChange={setPrimaryPhone}
                      />
                    )}
                  </Field>
                  <FormikErrorMessageWrapper name="phones" />
                </div>

                {/* Password - only if status is active */}
                {values.status === 'active' && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password (min 8 characters)"
                      className={touched.password && errors.password ? 'border-destructive' : ''}
                    />
                    <div className="min-h-[20px]">
                      <FormikErrorMessageWrapper name="password" />
                    </div>
                  </div>
                )}

                {/* Role and Status selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="roles">Roles *</Label>
                      <MultiRoleSelect
                        roles={roles}
                        selectedRoles={values.roles || []}
                        onRolesChange={(selectedRoles) => setFieldValue('roles', selectedRoles)}
                        disabled={rolesLoading}
                        placeholder="Select roles (at least one required)"
                        error={touched.roles && !!errors.roles}
                      />
                      <div className="min-h-[20px]">
                        <FormikErrorMessageWrapper name="roles" />
                      </div>
                    </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={values.status}
                      onValueChange={(value) => setFieldValue('status', value as 'active' | 'suspended')}
                      disabled={rolesLoading}
                    >
                      <SelectTrigger className={touched.status && errors.status ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="min-h-[20px]">
                      <FormikErrorMessageWrapper name="status" />
                    </div>
                  </div>
                </div>

                {/* Address fields: Street address */}
                <div className="grid gap-2">
                  <Label htmlFor="street">Street address</Label>
                  <Field
                    as={Input}
                    id="street"
                    name="street"
                    placeholder="Street address"
                    maxLength={80}
                    className={touched.street && (errors as any).street ? 'border-destructive' : ''}
                  />
                  <FormikErrorMessageWrapper name="street" />
                </div>

                {/* Unit or suite number */}
                <div className="grid gap-2">
                  <Label htmlFor="apt">Unit or suite number</Label>
                  <Field
                    as={Input}
                    id="apt"
                    name="apt"
                    placeholder="Apt, suite, unit, building, floor, etc."
                    maxLength={80}
                    className={touched.apt && (errors as any).apt ? 'border-destructive' : ''}
                  />
                  <FormikErrorMessageWrapper name="apt" />
                </div>

                {/* Address fields: City, State, ZIP Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Field
                      as={Input}
                      id="city"
                      name="city"
                      placeholder="City"
                      maxLength={80}
                      className={touched.city && (errors as any).city ? 'border-destructive' : ''}
                    />
                    <FormikErrorMessageWrapper name="city" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Field name="state">
                      {({ field, form }: any) => (
                        <Select
                          value={field.value || ''}
                          onValueChange={(value) => form.setFieldValue('state', value)}
                        >
                          <SelectTrigger className={touched.state && (errors as any).state ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <FormikErrorMessageWrapper name="state" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Field
                      as={Input}
                      id="zipCode"
                      name="zipCode"
                      placeholder="ZIP Code"
                      maxLength={10}
                      className={touched.zipCode && (errors as any).zipCode ? 'border-destructive' : ''}
                    />
                    <FormikErrorMessageWrapper name="zipCode" />
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes about the user..."
                    className={`min-h-[80px] ${touched.notes && (errors as any).notes ? 'border-destructive' : ''}`}
                  />
                  <FormikErrorMessageWrapper name="notes" />
                </div>
              </div>

              <DialogFooter className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || rolesLoading}>
                  {isSubmitting ? 'Creating...' : 'Add User'}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
});

AddUserDialog.displayName = 'AddUserDialog';
