import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/business-locations";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  country_id: z.string().or(z.number()),
  parent_location_id: z.string().or(z.number()).nullable().optional(),
  currency_tax_id: z.string().or(z.number()).nullable().optional(),
  location_name: z.string().min(1, "Location Name is required"),
  location_code: z.string().nullable().optional(),
  location_type: z.enum(["Outlet", "Warehouse", "Kitchen", "Central Store"], { required_error: "Location Type is required" }),
  is_parent_location: z.boolean(),
  is_inventory_location: z.boolean(),
  is_purchasing_enabled: z.boolean(),
  is_sales_enabled: z.boolean(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function BusinessLocationFormPage({
  businessLocation,
  countries,
  parentLocations,
  taxProfiles = [],
}: PageProps<{ businessLocation?: any; countries: any[]; parentLocations: any[]; taxProfiles?: any[] }>) {
  const isEditing = !!businessLocation;

  const defaultValues: FormValues = {
    country_id: businessLocation?.country_id?.toString() || "",
    parent_location_id: businessLocation?.parent_location_id?.toString() || "",
    currency_tax_id: businessLocation?.currency_tax_id?.toString() || "",
    location_name: businessLocation?.location_name || "",
    location_code: businessLocation?.location_code || "",
    location_type: businessLocation?.location_type || "Outlet",
    is_parent_location: businessLocation?.is_parent_location ?? false,
    is_inventory_location: businessLocation?.is_inventory_location ?? true,
    is_purchasing_enabled: businessLocation?.is_purchasing_enabled ?? true,
    is_sales_enabled: businessLocation?.is_sales_enabled ?? true,
    status: businessLocation?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Business Location" : "Add Business Location"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(businessLocation.id) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Business Location" : "Add Business Location"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <XFormInput<FormValues>
            label="Location Name"
            name="location_name"
            placeholder="e.g. Downtown Outlet"
          />
          <XFormInput<FormValues>
            label="Location Code"
            name="location_code"
            placeholder="e.g. DTO-001 (Optional)"
          />
          <XFormSelect<FormValues>
            label="Location Type"
            name="location_type"
            options={[
              { label: "Outlet", value: "Outlet" },
              { label: "Warehouse", value: "Warehouse" },
              { label: "Kitchen", value: "Kitchen" },
              { label: "Central Store", value: "Central Store" },
            ]}
          />
          <XFormSelect<FormValues>
            label="Country"
            name="country_id"
            options={countries.map((c) => ({
              label: c.name,
              value: c.id.toString(),
            }))}
          />
          <XFormSelect<FormValues>
            label="Parent Location"
            name="parent_location_id"
            options={[
              { label: "None", value: "" },
              ...parentLocations.map((p) => ({
                label: p.location_name,
                value: p.id.toString(),
              })),
            ]}
          />
          <XFormSelect<FormValues>
            label="Tax Profile"
            name="currency_tax_id"
            description="Specific tax rate to apply for transactions at this branch."
            options={[
              { label: "None (0% Tax)", value: "" },
              ...taxProfiles.map((t) => ({
                label: `${t.tax_type} (${t.tax_percentage}%) - ${t.currency}`,
                value: t.id.toString(),
              })),
            ]}
          />
          <XFormSwitch<FormValues>
            label="Is Parent Location?"
            name="is_parent_location"
            description="Allow other locations to be grouped under this location"
          />
          <XFormSwitch<FormValues>
            label="Is Inventory Location?"
            name="is_inventory_location"
            description="Track inventory at this location"
          />
          <XFormSwitch<FormValues>
            label="Is Purchasing Enabled?"
            name="is_purchasing_enabled"
            description="Allow purchasing workflows for this location"
          />
          <XFormSwitch<FormValues>
            label="Is Sales Enabled?"
            name="is_sales_enabled"
            description="Allow sales workflows for this location"
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this location"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
