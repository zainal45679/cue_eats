import React from "react";
import CurrencyTaxFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function CurrencyTaxEdit({
  currencyTax,
  countries,
}: PageProps<{ currencyTax: any; countries: any[] }>) {
  return (
    <CurrencyTaxFormPage currencyTax={currencyTax} countries={countries} />
  );
}
