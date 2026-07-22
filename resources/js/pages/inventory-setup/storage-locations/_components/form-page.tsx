import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/storage-locations";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  business_location_id: z.string().or(z.number()),
  storage_name: z.string().min(1, "Storage Name is required"),
  storage_type: z.enum(["Cold Storage", "Dry Storage", "Freezer", "General"], { required_error: "Storage Type is required" }),
  default_receiving_location: z.string().nullable().optional(),
  default_issue_location: z.string().nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function StorageLocationFormPage({
  storageLocation,
  businessLocations,
}: PageProps<{ storageLocation?: any; businessLocations: any[] }>) {
  const isEditing = !!storageLocation;

  const defaultValues: FormValues = {
    business_location_id: storageLocation?.business_location_id?.toString() || "",
    storage_name: storageLocation?.storage_name || "",
    storage_type: storageLocation?.storage_type || "General",
    default_receiving_location: storageLocation?.default_receiving_location || "",
    default_issue_location: storageLocation?.default_issue_location || "",
    status: storageLocation?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Storage Location" : "Add Storage Location"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(storageLocation.id) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Storage Location" : "Add Storage Location"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <XFormInput<FormValues>
            label="Storage Name"
            name="storage_name"
            placeholder="e.g. Main Freezer"
          />
          <XFormSelect<FormValues>
            label="Business Location"
            name="business_location_id"
            options={businessLocations.map((b) => ({
              label: b.location_name,
              value: b.id.toString(),
            }))}
          />
          <XFormSelect<FormValues>
            label="Storage Type"
            name="storage_type"
            options={[
              { label: "Cold Storage", value: "Cold Storage" },
              { label: "Dry Storage", value: "Dry Storage" },
              { label: "Freezer", value: "Freezer" },
              { label: "General", value: "General" },
            ]}
          />
          <XFormInput<FormValues>
            label="Default Receiving Location"
            name="default_receiving_location"
            placeholder="e.g. Dock A (Optional)"
          />
          <XFormInput<FormValues>
            label="Default Issue Location"
            name="default_issue_location"
            placeholder="e.g. Counter 1 (Optional)"
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this storage location"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
