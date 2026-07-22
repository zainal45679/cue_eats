import React from "react";
import CurrencyTaxFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function CurrencyTaxAdd({
  countries,
}: PageProps<{ countries: any[] }>) {
  return <CurrencyTaxFormPage countries={countries} />;
}
