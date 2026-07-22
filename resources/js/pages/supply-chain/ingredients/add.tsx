import React from "react";
import IngredientFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function IngredientAdd({
  categories,
  brands,
  uoms,
}: PageProps<{
  categories: any[];
  brands: any[];
  uoms: any[];
}>) {
  return (
    <IngredientFormPage
      categories={categories}
      brands={brands}
      uoms={uoms}
    />
  );
}
