import React from 'react';
import IngredientSupplierFormPage from './_components/form-page';
import type { PageProps } from '@/types';

export default function AddIngredientSupplier(props: PageProps<{
  ingredients: any[];
  suppliers: any[];
  uoms: any[];
  currencies: any[];
}>) {
  return <IngredientSupplierFormPage {...props} />;
}
