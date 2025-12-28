'use client';

import React, { memo, useState, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { IconPlus } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { MultiPhoneInput } from '@/app/components/pages/users/users-controls/add-user-dialog/multi-phone-input';
import { FormikErrorMessageWrapper } from '@/app/components/ui/error-message/formik-error-message';
import { AppDispatch, RootState } from '@/lib/store';
import { createClient, fetchClients } from '@/lib/store/slices/clients-slice/clients-slice';
import { addClientValidationSchema, AddClientFormValues } from './add-client-dialog.validation';
import { toast } from 'sonner';
import { US_STATES } from '@/app/components/pages/users/users-table-columns/user-drawer/us-states.constants';
import { cleanPhoneNumber } from '@/app/components/pages/chat/phone-formatter';
import { CLIENTS_PAGE_LIMIT } from '../../clients.constants';

const initialValues: AddClientFormValues = {
  name: '',
  email: '',
  phones: [], // At least one phone is required (validated by schema)
  street: '',
  apt: '',
  city: '',
  state: 'Washington',
  zipCode: '',
  notes: '',
};

export const AddClientDialog: React.FC = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const pagination = useSelector((state: RootState) => state.clients.pagination);
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [primaryPhone, setPrimaryPhone] = useState<string | null>(null);

  const handleSubmit = async (
    values: AddClientFormValues,
    { resetForm }: FormikHelpers<AddClientFormValues>,
  ) => {
    try {
      // Подготовка данных: преобразуем phones в формат для бэкенда, очищаем форматирование
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

      const clientData = {
        ...(values.name?.trim() && { name: values.name.trim() }),
        ...(values.email?.trim() && { email: values.email.trim() }),
        phones,
        ...(values.street?.trim() && { street: values.street.trim() }),
        ...(values.apt?.trim() && { apt: values.apt.trim() }),
        ...(values.city?.trim() && { city: values.city.trim() }),
        ...(values.state?.trim() && { state: values.state.trim() }),
        ...(values.zipCode?.trim() && { zipCode: values.zipCode.trim() }),
        ...(values.notes?.trim() && { notes: values.notes.trim() }),
      };

      await dispatch(createClient(clientData)).unwrap();
      toast.success('Client created successfully');
      resetForm();
      setFormKey((prev) => prev + 1);
      setIsOpen(false);
      
      // Обновляем список клиентов с текущей страницы и статус фильтром
      const currentPage = pagination?.page || 1;
      const statusFilter = localStorage.getItem('clients-table-status-filter');
      const parsedStatus = statusFilter ? JSON.parse(statusFilter) : null;
      
      dispatch(fetchClients({ 
        page: currentPage, 
        limit: CLIENTS_PAGE_LIMIT, 
        status: parsedStatus 
      }));
    } catch (error: any) {
      toast.error(error || 'Failed to create client');
    }
  };

  const handleOpenChange = useCallback((open: boolean) => {
    try {
      setIsOpen(open);
      if (!open) {
        // Сброс формы при закрытии
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
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-4">
        <DialogHeader className="pb-3">
          <DialogTitle>Add New Client</DialogTitle>

        </DialogHeader>
        <Formik
          key={formKey}
          initialValues={initialValues}
          validationSchema={addClientValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="flex flex-col overflow-hidden">
              <div className="grid gap-4 overflow-y-auto pl-1 pr-2 flex-1">
                {/* First row: Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Enter full name"
                      maxLength={70}
                      className={touched.name && errors.name ? 'border-destructive' : ''}
                    />
                    <div className="min-h-[20px]">
                      <ErrorMessage name="name" component="div" className="text-sm text-destructive" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      maxLength={80}
                      className={touched.email && errors.email ? 'border-destructive' : ''}
                    />
                    <div className="min-h-[20px]">
                      <ErrorMessage name="email" component="div" className="text-sm text-destructive" />
                    </div>
                  </div>
                </div>

                {/* Second row: Phone */}
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Field name="phones">
                    {({ field, form }: any) => (
                      <MultiPhoneInput
                        phones={field.value || []}
                        onPhonesChange={(phones: string[]) => form.setFieldValue('phones', phones)}
                        onPrimaryPhoneChange={setPrimaryPhone}
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
                      className={touched.city && errors.city ? 'border-destructive' : ''}
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
                        >
                          <SelectTrigger className={touched.state && errors.state ? 'border-destructive' : ''}>
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
                      className={touched.zipCode && errors.zipCode ? 'border-destructive' : ''}
                    />
                    <ErrorMessage name="zipCode" component="div" className="text-sm text-destructive" />
                  </div>
                </div>

                {/* Notes section */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes about the client..."
                    maxLength={300}
                    className={`min-h-[80px] ${touched.notes && errors.notes ? 'border-destructive' : ''}`}
                  />
                  <ErrorMessage name="notes" component="div" className="text-sm text-destructive" />
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Add Client'}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
});

AddClientDialog.displayName = 'AddClientDialog';
