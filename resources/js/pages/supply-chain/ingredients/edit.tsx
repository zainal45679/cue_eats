import React from "react";
import IngredientFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function IngredientEdit({
  ingredient,
  categories,
  brands,
  uoms,
}: PageProps<{
  ingredient: any;
  categories: any[];
  brands: any[];
  uoms: any[];
}>) {
  return (
    <IngredientFormPage
      ingredient={ingredient}
      categories={categories}
      brands={brands}
      uoms={uoms}
    />
  );
}
