import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/brands";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  manufacturer_name: z.string().nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function BrandFormPage({
  brand,
}: PageProps<{ brand?: any }>) {
  const isEditing = !!brand;

  const defaultValues: FormValues = {
    name: brand?.name || "",
    manufacturer_name: brand?.manufacturer_name || "",
    status: brand?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Brand" : "Add Brand"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(brand.uuid) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Brand" : "Add Brand"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <XFormInput<FormValues>
            label="Brand Name"
            name="name"
            placeholder="e.g. Coca Cola"
          />
          <XFormInput<FormValues>
            label="Manufacturer Name"
            name="manufacturer_name"
            placeholder="e.g. The Coca-Cola Company (Optional)"
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this brand"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
