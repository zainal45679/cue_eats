import { PackageOpen } from "lucide-react";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";

type InventoryLotSummary = {
  id: string;
  internal_lot_number: string;
  batch_number: string | null;
  mfg_date: string | null;
  expiry_date: string | null;
  available_qty: number;
  traceability_status: string;
};

type InventoryBalanceSummary = {
  ingredient?: { name?: string; base_uom?: { code?: string } };
  storage_location?: { storage_name?: string };
  lots?: InventoryLotSummary[];
};

type BatchDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: InventoryBalanceSummary | null;
};

function expiryLabel(expiryDate?: string | null) {
  if (!expiryDate) {
    return {
      label: "No expiry recorded",
      className: "bg-muted text-muted-foreground",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) {
    return {
      label: `Expired ${Math.abs(days)}d ago`,
      className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    };
  }
  if (days <= 2) {
    return {
      label: days === 0 ? "Expires today" : `${days}d left`,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    };
  }
  return {
    label: `${days}d left`,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
}

export function BatchDetailsDialog({
  open,
  onOpenChange,
  balance,
}: BatchDetailsDialogProps) {
  const lots = balance?.lots || [];
  const unit = balance?.ingredient?.base_uom?.code || "";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageOpen className="size-5 text-primary" />
            {balance?.ingredient?.name || "Ingredient"} batches
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {balance?.storage_location?.storage_name} · {lots.length} active{" "}
            {lots.length === 1 ? "batch" : "batches"}
          </p>
        </DialogHeader>

        {lots.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
            No active batch records are available for this stock balance.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/95 text-left">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Batch</th>
                  <th className="px-3 py-2.5 font-medium">Quantity</th>
                  <th className="px-3 py-2.5 font-medium">Manufactured</th>
                  <th className="px-3 py-2.5 font-medium">Expiry</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lots.map((lot) => {
                  const status = expiryLabel(lot.expiry_date);
                  return (
                    <tr key={lot.id}>
                      <td className="px-3 py-3">
                        <div className="font-medium">
                          {lot.batch_number || "Batch not recorded"}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {lot.internal_lot_number}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold">
                        {Number(lot.available_qty).toFixed(3)} {unit}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {lot.mfg_date || "—"}
                      </td>
                      <td className="px-3 py-3">{lot.expiry_date || "—"}</td>
                      <td className="px-3 py-3">
                        <Badge className={status.className} variant="secondary">
                          {status.label}
                        </Badge>
                        {lot.traceability_status === "legacy_unverified" && (
                          <div className="mt-1 text-[11px] text-amber-600">
                            Historical total; batch unverified
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
