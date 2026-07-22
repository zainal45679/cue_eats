import React from "react";
import SupplierFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function SupplierAdd({
  serviceAreas,
}: PageProps<{ serviceAreas: any[] }>) {
  return <SupplierFormPage serviceAreas={serviceAreas} />;
}
