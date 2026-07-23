import { FormMode } from "@/components/x/enum";
import { Head } from "@inertiajs/react";
import InventoryBalanceForm from "./_components/form-page";
import type { PageProps } from "@/types";

export default function InventoryBalanceAdd({
  ingredients,
  storageLocations,
}: PageProps<{
  ingredients: any[];
  storageLocations: any[];
}>) {
  return (
    <>
      <Head title="Add Inventory Balance" />
      <div className="space-y-6">
        <InventoryBalanceForm 
          mode={FormMode.CREATE} 
          title="Add Inventory Balance" 
          ingredients={ingredients}
          storageLocations={storageLocations}
        />
      </div>
    </>
  );
}
