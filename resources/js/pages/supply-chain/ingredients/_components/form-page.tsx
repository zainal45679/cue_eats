import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/ingredients";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().nullable().optional(),
  ingredient_category_id: z.string().or(z.number()).nullable().optional(),
  base_uom_id: z.string().or(z.number()).nullable().optional(),
  brand_id: z.string().or(z.number()).nullable().optional(),
  is_inventory_item: z.boolean(),
  is_purchasable: z.boolean(),
  is_recipe_item: z.boolean(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function IngredientFormPage({
  ingredient,
  categories,
  brands,
  uoms,
}: PageProps<{
  ingredient?: any;
  categories: any[];
  brands: any[];
  uoms: any[];
}>) {
  const isEditing = !!ingredient;

  const defaultValues: FormValues = {
    name: ingredient?.name || "",
    code: ingredient?.code || "",
    ingredient_category_id: ingredient?.ingredient_category_id?.toString() || "",
    base_uom_id: ingredient?.base_uom_id?.toString() || "",
    brand_id: ingredient?.brand_id?.toString() || "",
    is_inventory_item: ingredient?.is_inventory_item ?? true,
    is_purchasable: ingredient?.is_purchasable ?? true,
    is_recipe_item: ingredient?.is_recipe_item ?? false,
    status: ingredient?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Ingredient" : "Add Ingredient"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(ingredient.uuid) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Ingredient" : "Add Ingredient"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <XFormInput<FormValues>
              label="Ingredient Name"
              name="name"
              placeholder="e.g. Tomato, Ground Beef, Packaging Box"
            />
            <XFormInput<FormValues>
              label="Item Code"
              name="code"
              placeholder="Optional unique code"
            />
            <XFormSelect<FormValues>
              label="Category"
              name="ingredient_category_id"
              options={[
                { label: "Select Category", value: "" },
                ...categories.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                })),
              ]}
            />
            <XFormSelect<FormValues>
              label="Base UOM"
              name="base_uom_id"
              options={[
                { label: "Select Unit of Measure", value: "" },
                ...uoms.map((u) => ({
                  label: `${u.name} (${u.code})`,
                  value: u.id.toString(),
                })),
              ]}
            />
            <XFormSelect<FormValues>
              label="Brand"
              name="brand_id"
              options={[
                { label: "None / Generic", value: "" },
                ...brands.map((b) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              ]}
            />
          </div>

          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-medium">Item Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <XFormSwitch<FormValues>
                label="Inventory Item"
                name="is_inventory_item"
              />
              <XFormSwitch<FormValues>
                label="Purchasable"
                name="is_purchasable"
              />
              <XFormSwitch<FormValues>
                label="Recipe Item"
                name="is_recipe_item"
              />
            </div>
          </div>

          <div className="pt-6 border-t">
            <XFormSwitch<FormValues>
              label="Status"
              name="status"
            />
          </div>
        </XLaravelForm>
      </div>
    </>
  );
}
