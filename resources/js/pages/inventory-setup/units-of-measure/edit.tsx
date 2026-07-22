import React from "react";
import UnitOfMeasureFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function UnitsOfMeasureEdit({
  unitOfMeasure,
  baseUnits,
}: PageProps<{ unitOfMeasure: any; baseUnits: any[] }>) {
  return <UnitOfMeasureFormPage unitOfMeasure={unitOfMeasure} baseUnits={baseUnits} />;
}
