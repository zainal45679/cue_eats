import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/units-of-measure";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  type: z.enum(["Weight", "Volume", "Length", "Count"], { required_error: "Type is required" }),
  base_unit_id: z.string().nullable().optional(),
  conversion_factor: z.union([z.string(), z.number()]).nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function UnitOfMeasureFormPage({
  unitOfMeasure,
  baseUnits,
}: PageProps<{ unitOfMeasure?: any; baseUnits: any[] }>) {
  const isEditing = !!unitOfMeasure;

  const defaultValues: FormValues = {
    name: unitOfMeasure?.name || "",
    code: unitOfMeasure?.code || "",
    type: unitOfMeasure?.type || "Weight",
    base_unit_id: unitOfMeasure?.base_unit_id?.toString() || "",
    conversion_factor: unitOfMeasure?.conversion_factor || "",
    status: unitOfMeasure?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Unit of Measure" : "Add Unit of Measure"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(unitOfMeasure.id) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Unit of Measure" : "Add Unit of Measure"}
          transform={(data) => {
            const payload = { ...data };
            if (isEditing) {
              payload._method = "PUT";
            }
            if (!payload.base_unit_id) {
              payload.base_unit_id = null;
            }
            if (!payload.conversion_factor) {
              payload.conversion_factor = null;
            }
            return payload;
          }}
        >
          <XFormInput<FormValues>
            label="Name"
            name="name"
            placeholder="e.g. Kilogram"
          />
          <XFormInput<FormValues>
            label="Code (Abbreviation)"
            name="code"
            placeholder="e.g. kg"
          />
          <XFormSelect<FormValues>
            label="Type"
            name="type"
            options={[
              { label: "Weight", value: "Weight" },
              { label: "Volume", value: "Volume" },
              { label: "Length", value: "Length" },
              { label: "Count", value: "Count" },
            ]}
          />
          <XFormSelect<FormValues>
            label="Base Unit (Optional for conversions)"
            name="base_unit_id"
            options={[
              { label: "None", value: "" },
              ...baseUnits.map((u) => ({
                label: `${u.name} (${u.code})`,
                value: u.id.toString(),
              })),
            ]}
          />
          <XFormInput<FormValues>
            label="Conversion Factor (If Base Unit is selected)"
            name="conversion_factor"
            placeholder="e.g. 1000"
            description="How many base units make up this unit?"
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this unit"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
