import React from 'react';
import IngredientSupplierFormPage from './_components/form-page';
import type { PageProps } from '@/types';

export default function EditIngredientSupplier(props: PageProps<{
  mapping: any;
  ingredients: any[];
  suppliers: any[];
  uoms: any[];
  currencies: any[];
}>) {
  return <IngredientSupplierFormPage {...props} />;
}
