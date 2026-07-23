import z from "zod";
import { FormMode } from "@/components/x/enum";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";

type InventoryBalance = {
  uuid?: string;
  ingredient_id: string | number;
  storage_location_id: string | number;
  available_qty: string | number;
  reserved_qty: string | number;
  on_order_qty: string | number;
};

type PageFormProps = {
  mode?: FormMode;
  pageData?: InventoryBalance;
  title: string;
  ingredients: any[];
  storageLocations: any[];
};

const schema = z.object({
  ingredient_id: z.number().or(z.string().transform(Number)),
  storage_location_id: z.number().or(z.string().transform(Number)),
  available_qty: z.number().min(0).or(z.string().transform(Number)),
  reserved_qty: z.number().min(0).or(z.string().transform(Number)),
  on_order_qty: z.number().min(0).or(z.string().transform(Number)),
});

import { store, update } from "@/generated/routes/inventory-balances";

export default function InventoryBalanceForm({
  title,
  pageData,
  mode = FormMode.CREATE,
  ingredients,
  storageLocations,
}: PageFormProps) {
  const isEdit = mode === FormMode.EDIT;

  type TSchema = z.infer<typeof schema>;
  
  const initialValues: TSchema = {
    ingredient_id: pageData?.ingredient_id || ("" as any),
    storage_location_id: pageData?.storage_location_id || ("" as any),
    available_qty: pageData?.available_qty || 0,
    reserved_qty: pageData?.reserved_qty || 0,
    on_order_qty: pageData?.on_order_qty || 0,
  };

  return (
    <XLaravelForm
      action={isEdit ? update.url(pageData!.uuid!) : store.url()}
      defaultValues={initialValues}
      method={"post"}
      schema={schema}
      title={title || (isEdit ? "Edit Inventory Balance" : "Create Inventory Balance")}
      transform={(data) => (isEdit ? { ...data, _method: "PUT" } : data)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XFormSelect<TSchema>
          label="Ingredient"
          name="ingredient_id"
          options={ingredients.map((item) => ({
            label: item.name,
            value: item.id.toString(),
          }))}
          placeholder="Select Ingredient..."
        />

        <XFormSelect<TSchema>
          label="Storage Location"
          name="storage_location_id"
          options={storageLocations.map((loc) => ({
            label: `${loc.name} - ${loc.business_location?.location_name || "Unknown Branch"}`,
            value: loc.id.toString(),
          }))}
          placeholder="Select Storage Location..."
        />

        <XFormInput<TSchema>
          label="Available Quantity"
          name="available_qty"
          type="number"
          step="0.001"
        />

        <XFormInput<TSchema>
          label="Reserved Quantity"
          name="reserved_qty"
          type="number"
          step="0.001"
        />

        <XFormInput<TSchema>
          label="On Order Quantity"
          name="on_order_qty"
          type="number"
          step="0.001"
        />
      </div>
    </XLaravelForm>
  );
}
