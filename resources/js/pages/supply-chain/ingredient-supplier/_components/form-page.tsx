import React from 'react';
import { Head } from '@inertiajs/react';
import { store, update } from '@/generated/routes/ingredient-suppliers';
import { z } from 'zod';
import { XLaravelForm } from '@/components/x/form/XLaravelForm';
import { XFormInput } from '@/components/x/form/components/XFormInput';
import { XFormSelect } from '@/components/x/form/components/XFormSelect';
import { XFormSwitch } from '@/components/x/form/components/XFormSwitch';
import type { PageProps } from '@/types';

const schema = z.object({
  ingredient_id: z.string().or(z.number()),
  supplier_id: z.string().or(z.number()),
  purchase_uom_id: z.string().or(z.number()),
  moq: z.string().or(z.number()),
  price: z.string().or(z.number()),
  currency_tax_id: z.string().or(z.number()).nullable().optional(),
  lead_time_days: z.string().or(z.number()),
  is_preferred: z.boolean(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function IngredientSupplierFormPage({
  mapping,
  ingredients,
  suppliers,
  uoms,
  currencies,
}: PageProps<{
  mapping?: any;
  ingredients: any[];
  suppliers: any[];
  uoms: any[];
  currencies: any[];
}>) {
  const isEditing = !!mapping;

  const defaultValues: FormValues = {
    ingredient_id: mapping?.ingredient_id?.toString() || '',
    supplier_id: mapping?.supplier_id?.toString() || '',
    purchase_uom_id: mapping?.purchase_uom_id?.toString() || '',
    moq: mapping?.moq || '',
    price: mapping?.price || '',
    currency_tax_id: mapping?.currency_tax_id?.toString() || '',
    lead_time_days: mapping?.lead_time_days || '',
    is_preferred: mapping?.is_preferred ?? false,
    status: mapping?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? 'Edit Mapping' : 'Add Mapping'} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(mapping.uuid) : store.url()}
          defaultValues={defaultValues}
          method={'post'}
          schema={schema}
          title={isEditing ? 'Edit Mapping' : 'Add Mapping'}
          transform={(data) => (isEditing ? { ...data, _method: 'PUT' } : data)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <XFormSelect<FormValues>
              label="Ingredient"
              name="ingredient_id"
              options={[
                { label: 'Select Ingredient', value: '' },
                ...ingredients.map((i) => ({
                  label: i.name,
                  value: i.id.toString(),
                })),
              ]}
            />
            <XFormSelect<FormValues>
              label="Supplier"
              name="supplier_id"
              options={[
                { label: 'Select Supplier', value: '' },
                ...suppliers.map((s) => ({
                  label: s.name,
                  value: s.id.toString(),
                })),
              ]}
            />
            <XFormSelect<FormValues>
              label="Purchase UOM"
              name="purchase_uom_id"
              options={[
                { label: 'Select UOM', value: '' },
                ...uoms.map((u) => ({
                  label: `${u.name} (${u.code})`,
                  value: u.id.toString(),
                })),
              ]}
            />
            <XFormInput<FormValues>
              label="MOQ (Minimum Order Qty)"
              name="moq"
              type="number"
              placeholder="e.g. 10"
            />
            <XFormInput<FormValues>
              label="Price"
              name="price"
              type="number"
              step="0.01"
              placeholder="e.g. 15.50"
            />
            <XFormSelect<FormValues>
              label="Currency / Tax Code"
              name="currency_tax_id"
              options={[
                { label: 'Select Currency', value: '' },
                ...currencies.map((c) => ({
                  label: `${c.currency} (${c.tax_percentage}%)`,
                  value: c.id.toString(),
                })),
              ]}
            />
            <XFormInput<FormValues>
              label="Lead Time (Days)"
              name="lead_time_days"
              type="number"
              placeholder="e.g. 3"
            />
          </div>

          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-medium">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <XFormSwitch<FormValues>
                label="Preferred Supplier"
                name="is_preferred"
              />
              <XFormSwitch<FormValues>
                label="Active Status"
                name="status"
              />
            </div>
          </div>
        </XLaravelForm>
      </div>
    </>
  );
}
