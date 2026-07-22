import React from "react";
import BrandFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function BrandEdit({
  brand,
}: PageProps<{ brand: any }>) {
  return <BrandFormPage brand={brand} />;
}
