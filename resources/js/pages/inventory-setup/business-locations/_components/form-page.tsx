import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/business-locations";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import { XFormTextArea } from "@/components/x/form/components/XFormTextArea";
import type { PageProps } from "@/types";

const schema = z.object({
  country_id: z.string().or(z.number()),
  parent_location_id: z.string().or(z.number()).nullable().optional(),
  currency_tax_id: z.string().or(z.number()).nullable().optional(),
  location_name: z.string().min(1, "Location Name is required"),
  location_code: z.string().nullable().optional(),
  location_type: z.string().min(1, "Location Type is required"),
  is_parent_location: z.boolean(),
  is_inventory_location: z.boolean(),
  is_purchasing_enabled: z.boolean(),
  is_sales_enabled: z.boolean(),
  status: z.boolean(),
  service_type: z.enum(["qsr", "dine_in"]).optional().nullable(),
  kitchen_workflow: z.enum(["print_only", "screen_only", "both"]).optional().nullable(),
  receipt_header: z.string().optional().nullable(),
  receipt_footer: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").or(z.literal("")).optional().nullable(),
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
    service_type: businessLocation?.service_type || "qsr",
    kitchen_workflow: businessLocation?.kitchen_workflow || "print_only",
    receipt_header: businessLocation?.receipt_header || "",
    receipt_footer: businessLocation?.receipt_footer || "",
    address: businessLocation?.address || "",
    phone: businessLocation?.phone || "",
    email: businessLocation?.email || "",
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
              { label: "Central Kitchen", value: "central_kitchen" },
              { label: "Store", value: "Store" },
              { label: "outlet (Legacy)", value: "outlet" },
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

          <div className="pt-6 pb-2 border-t mt-8">
            <h3 className="text-lg font-medium text-foreground">POS & Print Settings</h3>
            <p className="text-sm text-muted-foreground">Configure the kitchen workflow and receipt prints for this location.</p>
          </div>

          <XFormSelect<FormValues>
            label="Service Type"
            name="service_type"
            options={[
              { label: "QSR / Self-Service", value: "qsr" },
              { label: "Fine Dining / Table Service", value: "dine_in" },
            ]}
          />

          <XFormSelect<FormValues>
            label="Kitchen Workflow"
            name="kitchen_workflow"
            options={[
              { label: "Print Only (Paper KOT)", value: "print_only" },
              { label: "Screen Only (KDS)", value: "screen_only" },
              { label: "Both (Print & Screen)", value: "both" },
            ]}
          />

          <XFormTextArea<FormValues>
            label="Receipt Header"
            name="receipt_header"
            placeholder="e.g. Welcome to Cue Eats! \nGSTIN: 123456789"
          />

          <XFormTextArea<FormValues>
            label="Receipt Footer"
            name="receipt_footer"
            placeholder="e.g. Thank you for your visit!"
          />

          <XFormTextArea<FormValues>
            label="Location Address"
            name="address"
            placeholder="Address for the receipt printout"
          />

          <XFormInput<FormValues>
            label="Location Phone"
            name="phone"
            placeholder="Phone for the receipt printout"
          />

          <XFormInput<FormValues>
            label="Location Email"
            name="email"
            placeholder="Email for the receipt printout"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
