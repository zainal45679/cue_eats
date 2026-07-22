import React from "react";
import UnitOfMeasureFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function UnitsOfMeasureAdd({ baseUnits }: PageProps<{ baseUnits: any[] }>) {
  return <UnitOfMeasureFormPage baseUnits={baseUnits} />;
}
