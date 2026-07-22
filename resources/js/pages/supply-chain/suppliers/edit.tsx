import React from "react";
import SupplierFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function SupplierEdit({
  supplier,
  serviceAreas,
}: PageProps<{
  supplier: any;
  serviceAreas: any[];
}>) {
  return (
    <SupplierFormPage
      supplier={supplier}
      serviceAreas={serviceAreas}
    />
  );
}
