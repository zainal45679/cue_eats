import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/currency-tax";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  country_id: z.string().or(z.number()),
  currency: z.string().min(1, "Currency is required"),
  tax_type: z.enum(["GST", "VAT"], { required_error: "Tax Type is required" }),
  tax_percentage: z.number().nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function CurrencyTaxFormPage({
  currencyTax,
  countries,
}: PageProps<{ currencyTax?: any; countries: any[] }>) {
  const isEditing = !!currencyTax;

  const defaultValues: FormValues = {
    country_id: currencyTax?.country_id?.toString() || "",
    currency: currencyTax?.currency || "",
    tax_type: currencyTax?.tax_type || "GST",
    tax_percentage: currencyTax?.tax_percentage ? Number(currencyTax.tax_percentage) : undefined,
    status: currencyTax?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Currency & Tax" : "Add Currency & Tax"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(currencyTax.id) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Currency & Tax" : "Add Currency & Tax"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <XFormSelect<FormValues>
            label="Country"
            name="country_id"
            options={countries.map((c) => ({
              label: c.name,
              value: c.id.toString(),
            }))}
          />
          <XFormInput<FormValues>
            label="Currency"
            name="currency"
            placeholder="e.g. USD, EUR, INR"
          />
          <XFormSelect<FormValues>
            label="Tax Type"
            name="tax_type"
            options={[
              { label: "GST", value: "GST" },
              { label: "VAT", value: "VAT" },
            ]}
          />
          <XFormInput<FormValues>
            label="Tax Percentage (%)"
            name="tax_percentage"
            type="number"
            placeholder="0.00"
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this tax rule"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
