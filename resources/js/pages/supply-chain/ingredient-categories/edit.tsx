import React from "react";
import IngredientCategoryFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function IngredientCategoryEdit({
  category,
  parentCategories,
}: PageProps<{ category: any; parentCategories: any[] }>) {
  return <IngredientCategoryFormPage category={category} parentCategories={parentCategories} />;
}
