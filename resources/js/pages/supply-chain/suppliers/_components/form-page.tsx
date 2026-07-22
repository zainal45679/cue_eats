import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/suppliers";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  tax_number: z.string().nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function SupplierFormPage({
  supplier,
}: PageProps<{
  supplier?: any;
}>) {
  const isEditing = !!supplier;

  const defaultValues: FormValues = {
    name: supplier?.name || "",
    contact_name: supplier?.contact_name || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    tax_number: supplier?.tax_number || "",
    status: supplier?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Supplier" : "Add Supplier"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(supplier.uuid) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Supplier" : "Add Supplier"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <XFormInput<FormValues>
              label="Company Name"
              name="name"
              placeholder="e.g. Sysco, US Foods"
            />
            <XFormInput<FormValues>
              label="Contact Person"
              name="contact_name"
              placeholder="e.g. John Doe"
            />
            <XFormInput<FormValues>
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. orders@supplier.com"
            />
            <XFormInput<FormValues>
              label="Phone Number"
              name="phone"
              placeholder="e.g. (555) 123-4567"
            />
            <XFormInput<FormValues>
              label="Tax ID (GST/VAT)"
              name="tax_number"
              placeholder="Optional"
            />
          </div>

          <div className="pt-2">
            <XFormInput<FormValues>
              label="Billing/Physical Address"
              name="address"
              placeholder="Full address details"
            />
          </div>

          <div className="pt-4 border-t">
            <XFormSwitch<FormValues>
              label="Status"
              name="status"
              description="Activate or deactivate this supplier"
            />
          </div>
        </XLaravelForm>
      </div>
    </>
  );
}
