import React from "react";
import FormPage from "./_components/form-page";

export default function PurchaseOrderEdit({ purchaseOrder }: { purchaseOrder: any }) {
    return <FormPage defaultValues={purchaseOrder} />;
}
