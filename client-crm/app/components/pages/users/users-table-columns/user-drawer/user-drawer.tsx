'use client';

import { MultiPhoneInput } from '@/app/components/pages/users/users-controls/add-user-dialog/multi-phone-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
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
import { AppDispatch, RootState } from '@/lib/store';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import { updateUser } from '@/lib/store/slices/users-slice/users-slice';
import { User } from '@/lib/store/slices/users-slice/users-slice.types';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import * as yup from 'yup';
import { US_STATES } from './us-states.constants';
import { cleanPhoneNumber } from '@/app/components/pages/chat/phone-formatter';

export interface UserDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

interface UserFormValues {
  name?: string;
  email: string;
  phones: string[];
  password?: string;
  roles: string[]; // Array of role names (at least one required)
  status: 'active' | 'suspended' | 'archived';
  // Address fields
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

const userValidationSchema = yup.object().shape({
  name: yup
    .string()
    .optional()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must not exceed 30 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  phones: yup
    .array()
    .of(
      yup.string().test('phone-format', 'Phone must be +1 and 10 digits', (value) => {
        if (!value) return false;
        // Remove all non-digit characters except +
        const cleaned = value.replace(/[^\d+]/g, '');
        // Must start with +1 and have exactly 12 characters total (+1XXXXXXXXXX)
        return cleaned.startsWith('+1') && cleaned.length === 12;
      })
    )
    .max(10, 'Maximum 10 phone numbers allowed')
    .optional(),
  password: yup
    .string()
    .when('status', {
      is: 'active',
      then: (schema) => schema.optional().min(8, 'Password must be at least 8 characters'),
      otherwise: (schema) => schema.optional(),
    }),
  roles: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one role is required')
    .required('At least one role is required'),
  status: yup
    .string()
    .oneOf(['active', 'suspended', 'archived'], 'Invalid status')
    .required('Status is required'),
  street: yup.string().optional(),
  apt: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zipCode: yup.string().optional(),
  notes: yup.string().optional().max(300, 'Notes must not exceed 300 characters'),
});

const UserDrawerComponent: React.FC<UserDrawerProps> = ({ user, isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [initialStatus, setInitialStatus] = useState<'active' | 'suspended' | 'archived'>(user?.status ?? 'active');
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [primaryPhone, setPrimaryPhone] = useState<string | null>(
    user?.phones?.find(p => p.isPrimary)?.number || user?.phones?.[0]?.number || null
  );
  const [showArchiveConfirmDialog, setShowArchiveConfirmDialog] = useState(false);
  const [pendingArchiveStatus, setPendingArchiveStatus] = useState<'active' | 'suspended' | 'archived' | null>(null);
  const formikSetFieldValueRef = useRef<((field: string, value: any) => void) | null>(null);
  
  // Проверяем, является ли редактируемый пользователь текущим пользователем
  const isCurrentUser = Boolean(currentUser && (currentUser.sub === user?.id || currentUser.id === user?.id));

  // Синхронизируем внутреннее состояние с пропом isOpen
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (internalOpen && user) {
      fetchRoles();
      setInitialStatus(user.status ?? 'active');
    }
  }, [internalOpen, fetchRoles, user?.status]);

  // Очищаем таймаут при размонтировании компонента
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Обработчик закрытия диалога с задержкой для анимации
  const handleOpenChange = useCallback((open: boolean) => {
    try {
      setInternalOpen(open);
      if (!open) {
        // Очищаем предыдущий таймаут, если он существует
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        // Даем время на анимацию закрытия перед вызовом onClose
        closeTimeoutRef.current = setTimeout(() => {
          try {
            onClose(false);
          } catch (error) {
            console.error('Error calling onClose:', error);
          } finally {
            closeTimeoutRef.current = null;
          }
        }, 200);
      } else {
        // Если диалог открывается, очищаем таймаут
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error handling dialog open change:', error);
      // Продолжаем работу даже при ошибке
      setInternalOpen(false);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }
  }, [onClose]);

  // Обработчик подтверждения архивирования
  const handleArchiveConfirm = useCallback(() => {
    if (pendingArchiveStatus === 'archived' && formikSetFieldValueRef.current) {
      formikSetFieldValueRef.current('status', 'archived');
    }
    setShowArchiveConfirmDialog(false);
    setPendingArchiveStatus(null);
  }, [pendingArchiveStatus]);

  // Обработчик отмены архивирования
  const handleArchiveCancel = useCallback(() => {
    setShowArchiveConfirmDialog(false);
    setPendingArchiveStatus(null);
  }, []);

  if (!user) return null;

  const isArchived = user.status === 'archived';

  const initialValues: UserFormValues = useMemo(
    () => {
      const roles: string[] = [];
      if (user.role?.name) {
        roles.push(user.role.name);
      }
      // Добавляем все secondary roles
      if (user.secondaryRoles && user.secondaryRoles.length > 0) {
        user.secondaryRoles.forEach(role => {
          if (role?.name) {
            roles.push(role.name);
          }
        });
      }
      return {
      name: user.name ?? '',
      email: user.email ?? '',
      phones: user.phones?.map(p => p.number) || [],
      password: '',
        roles: roles.length > 0 ? roles : [],
      status: user.status ?? 'active',
      street: user.street ?? '',
      apt: user.apt ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      zipCode: user.zipCode ?? '',
      notes: user.notes ?? '',
      };
    },
    [user]
  );

  const handleSubmit = async (
    values: UserFormValues,
    { setSubmitting }: FormikHelpers<UserFormValues>
  ) => {
    try {
      if (!values.roles || values.roles.length === 0) {
        toast.error('At least one role is required');
        return;
      }

      // Первая роль - основная, остальные - secondary
      const primaryRoleName = values.roles[0];
      const secondaryRoleNames = values.roles.slice(1);

      const primaryRoleId = roles.find(r => r.name === primaryRoleName)?.id;
      if (!primaryRoleId) {
        toast.error('Selected primary role not found');
        return;
      }

      // Получаем IDs для всех secondary roles
      const secondaryRoleIds = secondaryRoleNames
        .map(name => roles.find(r => r.name === name)?.id)
        .filter((id): id is string => id !== undefined);
      
      if (secondaryRoleNames.length > 0 && secondaryRoleIds.length !== secondaryRoleNames.length) {
        toast.error('One or more selected secondary roles not found');
        return;
      }

      // Проверяем, что пользователь не пытается установить себе статус ARCHIVED
      // if (isCurrentUser && values.status === 'archived') {
      //   toast.error('You cannot set your own status to ARCHIVED');
      //   setSubmitting(false);
      //   return;
      // }

      // Проверяем изменение статуса с Suspended на Active - требуется пароль
      // const isRestoringFromSuspended = initialStatus === 'suspended' && values.status === 'active';
      
      // Если восстанавливаем из Suspended в Active и пароль не указан - ошибка
      // if (isRestoringFromSuspended && !values.password?.trim()) {
      //   toast.error('Password is required when restoring user from suspended to active status');
      //   setSubmitting(false);
      //   return;
      // }

      // Автоматически определяем canSignIn на основе статуса
      // const canSignIn = values.status === 'active';
      const canSignIn = user.status === 'active';

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

      // Обработка name: если пустое - отправляем null для удаления, иначе отправляем обрезанное значение
      const nameValue = values.name?.trim() || null;
      
      // Email не изменяется при обновлении пользователя - убираем из payload
      const payload: Record<string, unknown> = {
        name: nameValue,
        roleId: primaryRoleId,
        secondaryRoleIds: secondaryRoleIds.length > 0 ? secondaryRoleIds : [], // Пустой массив для удаления всех secondary roles
        // status: values.status,
        canSignIn: canSignIn,
      };
      if (phones) payload.phones = phones;
      if (values.street?.trim()) payload.street = values.street.trim();
      if (values.apt?.trim()) payload.apt = values.apt.trim();
      if (values.city?.trim()) payload.city = values.city.trim();
      if (values.state?.trim()) payload.state = values.state.trim();
      if (values.zipCode?.trim()) payload.zipCode = values.zipCode.trim();
      if (values.notes?.trim()) payload.notes = values.notes.trim();

      // Логика отправки пароля:
      // 1. Если статус Active и пароль указан - обновляем
      // 2. Если восстанавливаем из Suspended в Active - пароль обязателен (уже проверили выше)
      // 3. Если статус Active и пароль не указан - не отправляем (оставляем старый)
      // 4. Если статус Suspended или Archived - пароль не нужен
      // if (values.status === 'active' && values.password?.trim()) {
      //   payload.password = values.password.trim();
      // }
      if (user.status === 'active' && values.password?.trim()) {
        payload.password = values.password.trim();
      }

      await dispatch(updateUser({ id: user.id, userData: payload })).unwrap();
      toast.success('User updated successfully');
      // setInitialStatus(values.status); // Обновляем начальное состояние
      setInternalOpen(false);
      // Очищаем предыдущий таймаут, если он существует
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      // Даем время на анимацию закрытия перед вызовом onClose
      closeTimeoutRef.current = setTimeout(() => {
        try {
          onClose(false);
        } catch (error) {
          console.error('Error calling onClose after submit:', error);
        } finally {
          closeTimeoutRef.current = null;
        }
      }, 200);
    } catch (err: any) {
      toast.error(err || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-4">
        <DialogHeader className="pb-3">
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>
            {isArchived ? (
              <span className="text-destructive">This user is archived and cannot be modified.</span>
            ) : (
              'Update user information. Make changes to the fields below.'
            )}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={userValidationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, setFieldValue, values }) => {
            // Сохраняем setFieldValue в ref для использования в AlertDialog
            formikSetFieldValueRef.current = setFieldValue;
            
            return (
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
                      disabled={isArchived}
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
                      disabled={true}
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
                      <MultiPhoneInput
                        phones={field.value || []}
                        onPhonesChange={(phones: string[]) => form.setFieldValue('phones', phones)}
                        onPrimaryPhoneChange={setPrimaryPhone}
                        excludeUserId={user?.id}
                      />
                    )}
                  </Field>
                  <FormikErrorMessageWrapper name="phones" />
                </div>

                {/* Role and Status selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="roles">Roles *</Label>
                    <MultiRoleSelect
                      roles={roles}
                      selectedRoles={values.roles || []}
                      onRolesChange={(selectedRoles) => setFieldValue('roles', selectedRoles)}
                      disabled={rolesLoading || user.status === 'archived'}
                      placeholder="Select roles (at least one required)"
                      error={touched.roles && !!errors.roles}
                    />
                    <div className="min-h-[20px]">
                      <FormikErrorMessageWrapper name="roles" />
                    </div>
                  </div>
                  {/* <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={values.status}
                      onValueChange={(value) => {
                        const newStatus = value as 'active' | 'suspended' | 'archived';
                        if (newStatus === 'archived' && values.status !== 'archived') {
                          setPendingArchiveStatus(newStatus);
                          setShowArchiveConfirmDialog(true);
                        } else {
                          setFieldValue('status', newStatus);
                        }
                      }}
                      disabled={isArchived || isSubmitting}
                    >
                      <SelectTrigger className={touched.status && errors.status ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" disabled={isArchived}>Active</SelectItem>
                        <SelectItem value="suspended" disabled={isArchived}>Suspended</SelectItem>
                        <SelectItem value="archived" disabled={isArchived || isCurrentUser}>
                          Archived {isCurrentUser ? '(cannot archive yourself)' : '(cannot be changed)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="min-h-[20px]">
                      <FormikErrorMessageWrapper name="status" />
                      {isArchived && (
                        <div className="text-sm text-muted-foreground">
                          Archived users cannot be restored
                        </div>
                      )}
                    </div>
                  </div> */}
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
                    disabled={isArchived}
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
                    disabled={isArchived}
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
                      disabled={isArchived}
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
                          disabled={isArchived}
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
                      disabled={isArchived}
                      className={touched.zipCode && (errors as any).zipCode ? 'border-destructive' : ''}
                    />
                    <FormikErrorMessageWrapper name="zipCode" />
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2 pb-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes about the user..."
                    maxLength={300}
                    disabled={isArchived}
                    className={`min-h-[80px] ${touched.notes && (errors as any).notes ? 'border-destructive' : ''}`}
                  />
                  <FormikErrorMessageWrapper name="notes" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || rolesLoading || isArchived}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          );
          }}
        </Formik>
      </DialogContent>
      
      {/* Archive confirmation dialog */}
      <AlertDialog open={showArchiveConfirmDialog} onOpenChange={setShowArchiveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be permanently archived and will not be able to sign in or be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleArchiveCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export const UserDrawer = memo(UserDrawerComponent);

UserDrawer.displayName = 'UserDrawer';

