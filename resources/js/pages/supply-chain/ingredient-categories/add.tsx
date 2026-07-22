import React from "react";
import IngredientCategoryFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function IngredientCategoryAdd({
  parentCategories,
}: PageProps<{ parentCategories: any[] }>) {
  return <IngredientCategoryFormPage parentCategories={parentCategories} />;
}
