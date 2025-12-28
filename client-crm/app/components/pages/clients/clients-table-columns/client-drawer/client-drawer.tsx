'use client';

import { cleanPhoneNumber } from '@/app/components/pages/chat/phone-formatter';
import { addClientValidationSchema } from '@/app/components/pages/clients/clients-controls/add-client-dialog/add-client-dialog.validation';
import { MultiPhoneInput } from '@/app/components/pages/users/users-controls/add-user-dialog/multi-phone-input';
import { US_STATES } from '@/app/components/pages/users/users-table-columns/user-drawer/us-states.constants';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { FormikErrorMessageWrapper } from '@/app/components/ui/error-message/formik-error-message';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { AppDispatch, RootState } from '@/lib/store';
import { archiveClient, fetchClients, updateClient } from '@/lib/store/slices/clients-slice/clients-slice';
import { Client, ClientStatus } from '@/lib/store/slices/clients-slice/clients-slice.types';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { CLIENTS_PAGE_LIMIT } from '../../clients.constants';

export interface ClientDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export const ClientDrawer: React.FC<ClientDrawerProps> = memo(({ client, isOpen, onClose }) => {
  // Early return to avoid rendering without data
  if (!client) return null;

  const dispatch = useDispatch<AppDispatch>();
  const pagination = useSelector((state: RootState) => state.clients.pagination);
  const [primaryPhone, setPrimaryPhone] = useState<string | null>(
    client.phones?.find(p => p.isPrimary)?.number || client.phones?.[0]?.number || null
  );
  const [showArchiveConfirmDialog, setShowArchiveConfirmDialog] = useState(false);
  const [pendingArchiveStatus, setPendingArchiveStatus] = useState<ClientStatus | null>(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const formikSetFieldValueRef = useRef<((field: string, value: any) => void) | null>(null);

  const isArchived = client.status === 'archived';

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

  // Обработчик архивации клиента через отдельную кнопку
  const handleArchive = async () => {
    try {
      await dispatch(archiveClient(client.id)).unwrap();
      toast.success('Client archived successfully');
      setIsArchiveDialogOpen(false);
      onClose(false);
      
      // Обновляем список клиентов с текущей страницы
      const currentPage = pagination?.page || 1;
      const statusFilter = localStorage.getItem('clients-table-status-filter');
      const parsedStatus = statusFilter ? JSON.parse(statusFilter) : null;
      
      dispatch(fetchClients({ 
        page: currentPage, 
        limit: CLIENTS_PAGE_LIMIT, 
        status: parsedStatus 
      }));
    } catch (error: any) {
      toast.error(error || 'Failed to archive client');
    }
  };

  // Map client -> form initial values; memoize to avoid unnecessary re-mounts
  const initialValues = useMemo(
    () => ({
      name: client.name ?? '',
      email: client.email ?? '',
      phones: client.phones?.map(p => p.number) || [],
      status: client.status ?? 'active',
      street: client.street ?? '',
      apt: client.apt ?? '',
      city: client.city ?? '',
      state: client.state ?? '',
      zipCode: client.zipCode ?? '',
      notes: client.notes ?? '',
    }),
    [client]
  );

  // Handle update submit
  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    try {
      // Prepare phones array - clean formatting before sending
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
        : [];

      // Auto-set canSignIn based on status
      const canSignIn = values.status === 'active';

      // Prepare payload by trimming and omitting empty optional fields
      const payload: Record<string, unknown> = {
        phones,
        status: values.status,
        canSignIn,
      };
      if (values.name?.trim()) payload.name = values.name.trim();
      if (values.email?.trim()) payload.email = values.email.trim();
      if (values.street.trim()) payload.street = values.street.trim();
      if (values.apt.trim()) payload.apt = values.apt.trim();
      if (values.city.trim()) payload.city = values.city.trim();
      if (values.state.trim()) payload.state = values.state.trim();
      if (values.zipCode.trim()) payload.zipCode = values.zipCode.trim();
      if (values.notes.trim()) payload.notes = values.notes.trim();

      await dispatch(updateClient({ id: client.id, clientData: payload })).unwrap();
      toast.success('Client updated successfully');
      onClose(false);
      
      // Обновляем список клиентов с текущей страницы и статус фильтром
      const currentPage = pagination?.page || 1;
      const statusFilter = localStorage.getItem('clients-table-status-filter');
      const parsedStatus = statusFilter ? JSON.parse(statusFilter) : null;
      
      dispatch(fetchClients({ 
        page: currentPage, 
        limit: CLIENTS_PAGE_LIMIT, 
        status: parsedStatus 
      }));
    } catch (err: any) {
      toast.error(err || 'Failed to update client');
    } finally {
      setSubmitting(false);
    }
  };

  // Безопасная обработка закрытия диалога
  const handleOpenChange = useCallback((open: boolean) => {
    try {
      onClose(open);
    } catch (error) {
      console.error('Error handling dialog open change:', error);
      // Продолжаем работу даже при ошибке
      if (!open) {
        onClose(false);
      }
    }
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-4">
        <DialogHeader className="pb-3">
          <DialogTitle>Edit Client: {client.name}</DialogTitle>
          <DialogDescription>
            {isArchived ? (
              <span className="text-destructive">This client is archived and cannot be modified.</span>
            ) : (
              'Update client information. Make changes to the fields below.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Form layout mirrors AddClientDialog for consistency */}
        <Formik
          initialValues={initialValues}
          validationSchema={addClientValidationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, setFieldValue, values }) => {
            // Сохраняем setFieldValue в ref для использования в AlertDialog
            formikSetFieldValueRef.current = setFieldValue;
            
            return (
            <Form className="flex flex-col overflow-hidden">
              <div className="grid gap-4 overflow-y-auto pl-1 pr-2 flex-1">
                {/* Name and Status in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Enter full name"
                      maxLength={70}
                      disabled={isArchived}
                      className={touched.name && (errors as any).name ? 'border-destructive' : ''}
                    />
                    <div className="min-h-[20px]">
                      <ErrorMessage name="name" component="div" className="text-sm text-destructive" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={values.status}
                      onValueChange={(value) => {
                        const newStatus = value as ClientStatus;
                        if (newStatus === 'archived' && values.status !== 'archived') {
                          setPendingArchiveStatus(newStatus);
                          setShowArchiveConfirmDialog(true);
                        } else {
                          setFieldValue('status', newStatus);
                        }
                      }}
                      disabled={isArchived || isSubmitting}
                    >
                      <SelectTrigger className={touched.status && (errors as any).status ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" disabled={isArchived}>Active</SelectItem>
                        <SelectItem value="suspended" disabled={isArchived}>Suspended</SelectItem>
                        <SelectItem value="archived" disabled={isArchived}>
                          Archived (cannot be restored)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="min-h-[20px]">
                      {isArchived && (
                        <div className="text-sm text-muted-foreground">
                          Archived clients cannot be restored
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    maxLength={80}
                    disabled={isArchived}
                    className={touched.email && (errors as any).email ? 'border-destructive' : ''}
                  />
                  <div className="min-h-[20px]">
                    <ErrorMessage name="email" component="div" className="text-sm text-destructive" />
                  </div>
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Field name="phones">
                    {({ field, form }: any) => (
                      <MultiPhoneInput
                        phones={field.value || []}
                        onPhonesChange={(phones: string[]) => form.setFieldValue('phones', phones)}
                        onPrimaryPhoneChange={setPrimaryPhone}
                        disabled={isArchived}
                      />
                    )}
                  </Field>
                  <FormikErrorMessageWrapper name="phones" />
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
                  <ErrorMessage name="street" component="div" className="text-sm text-destructive" />
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
                  <ErrorMessage name="apt" component="div" className="text-sm text-destructive" />
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
                    <ErrorMessage name="city" component="div" className="text-sm text-destructive" />
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
                    <ErrorMessage name="state" component="div" className="text-sm text-destructive" />
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
                    <ErrorMessage name="zipCode" component="div" className="text-sm text-destructive" />
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2 pb-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes about the client..."
                    maxLength={300}
                    disabled={isArchived}
                    className={`min-h-[80px] ${touched.notes && (errors as any).notes ? 'border-destructive' : ''}`}
                  />
                  <ErrorMessage name="notes" component="div" className="text-sm text-destructive" />
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
  
                <Button type="submit" disabled={isSubmitting || isArchived}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          );
          }}
        </Formik>
      </DialogContent>

      {/* Archive confirmation dialog (from status change) */}
      <AlertDialog open={showArchiveConfirmDialog} onOpenChange={setShowArchiveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Client</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The client will be permanently archived and cannot be restored.
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

      {/* Archive dialog (from archive button) */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Client</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-2">
                <div className="font-medium text-amber-600">
                  ⚠️ Warning: This will archive the client &quot;{client.name || client.email}&quot;
                </div>
                <div className="text-sm">
                  Archived clients will not be able to sign in and will be hidden from active lists.
                  You can restore them later by changing their status back to Active.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleArchive}
            >
              Archive Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
});

ClientDrawer.displayName = 'ClientDrawer';

