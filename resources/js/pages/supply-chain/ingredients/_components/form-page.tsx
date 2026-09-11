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
  is_perishable: z.boolean(),
  shelf_life_days: z.coerce.number().nullable().optional(),
  storage_condition: z.string().nullable().optional(),
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
    is_perishable: ingredient?.is_perishable ?? false,
    shelf_life_days: ingredient?.shelf_life_days ?? null,
    storage_condition: ingredient?.storage_condition || "",
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
          {/* SECTION 1: CORE INFORMATION (Full Width 2-Column Grid) */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* SECTION 2: ITEM CONFIGURATION (Full Width Container) */}
          <div className="col-span-full pt-4 border-t space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Item Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border bg-muted/20">
              <XFormSwitch<FormValues>
                label="Inventory Item"
                name="is_inventory_item"
                wrapperClassName="w-auto col-span-1"
              />
              <XFormSwitch<FormValues>
                label="Purchasable"
                name="is_purchasable"
                wrapperClassName="w-auto col-span-1"
              />
              <XFormSwitch<FormValues>
                label="Recipe Item"
                name="is_recipe_item"
                wrapperClassName="w-auto col-span-1"
              />
            </div>
          </div>

          {/* SECTION 3: SHELF LIFE & PERISHABILITY (Full Width Dedicated Card) */}
          <div className="col-span-full pt-4 border-t space-y-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shelf Life & Perishability</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Track expiry dates and receive spoilage alerts during Goods Receipt (GRN) and Live Stock.</p>
            </div>
            
            <div className="p-5 rounded-xl border bg-muted/20 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <div className="font-semibold text-sm text-foreground">Perishable Item</div>
                  <div className="text-xs text-muted-foreground">Enable this if the item has an expiry date or spoils over time.</div>
                </div>
                <XFormSwitch<FormValues>
                  name="is_perishable"
                  wrapperClassName="w-auto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <XFormInput<FormValues>
                  label="Default Shelf Life (Days)"
                  name="shelf_life_days"
                  type="number"
                  placeholder="e.g. 3"
                />
                <XFormSelect<FormValues>
                  label="Storage Condition"
                  name="storage_condition"
                  options={[
                    { label: "Select Storage Condition", value: "" },
                    { label: "Ambient (Room Temp)", value: "ambient" },
                    { label: "Chilled (0°C - 4°C)", value: "chilled" },
                    { label: "Frozen (-18°C)", value: "frozen" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: STATUS (Full Width Dedicated Row) */}
          <div className="col-span-full pt-4 border-t">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
              <div>
                <div className="font-semibold text-sm text-foreground">Active Status</div>
                <div className="text-xs text-muted-foreground">Item is available for operations and recipes across Cue Eats.</div>
              </div>
              <XFormSwitch<FormValues>
                name="status"
                wrapperClassName="w-auto"
              />
            </div>
          </div>
        </XLaravelForm>
      </div>
    </>
  );
}
