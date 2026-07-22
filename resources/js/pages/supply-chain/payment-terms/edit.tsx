import React from "react";
import PaymentTermFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function PaymentTermEdit({
  paymentTerm,
}: PageProps<{ paymentTerm: any }>) {
  return <PaymentTermFormPage paymentTerm={paymentTerm} />;
}
