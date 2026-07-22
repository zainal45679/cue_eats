import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/payment-terms";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  credit_days: z.string().or(z.number()).transform(Number),
  advance_percentage: z.string().or(z.number()).transform(Number),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function PaymentTermFormPage({
  paymentTerm,
}: PageProps<{ paymentTerm?: any }>) {
  const isEditing = !!paymentTerm;

  const defaultValues: FormValues = {
    name: paymentTerm?.name || "",
    credit_days: paymentTerm?.credit_days ?? 0,
    advance_percentage: paymentTerm?.advance_percentage ?? 0,
    status: paymentTerm?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Payment Term" : "Add Payment Term"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(paymentTerm.uuid) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Payment Term" : "Add Payment Term"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <XFormInput<FormValues>
            label="Payment Term Name"
            name="name"
            placeholder="e.g. Net 30"
          />
          <XFormInput<FormValues>
            label="Credit Days"
            name="credit_days"
            type="number"
            min="0"
          />
          <XFormInput<FormValues>
            label="Advance Percentage (%)"
            name="advance_percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this payment term"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
