import { FormMode } from "@/components/x/enum";
import { Head } from "@inertiajs/react";
import InventoryBalanceForm from "./_components/form-page";
import type { PageProps } from "@/types";

export default function InventoryBalanceEdit({
  inventoryBalance,
  ingredients,
  storageLocations,
}: PageProps<{
  inventoryBalance: any;
  ingredients: any[];
  storageLocations: any[];
}>) {
  return (
    <>
      <Head title="Edit Inventory Balance" />
      <div className="space-y-6">
        <InventoryBalanceForm 
          mode={FormMode.EDIT} 
          pageData={inventoryBalance}
          title="Edit Inventory Balance" 
          ingredients={ingredients}
          storageLocations={storageLocations}
        />
      </div>
    </>
  );
}
