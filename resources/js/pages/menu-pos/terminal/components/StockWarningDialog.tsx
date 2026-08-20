import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface StockWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    outOfStockItems: any[];
    onConfirmOverride: () => void;
}

export function StockWarningDialog({
    open,
    onOpenChange,
    outOfStockItems,
    onConfirmOverride,
}: StockWarningDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                        Ingredient Stock Warning
                    </DialogTitle>
                </DialogHeader>

                <div className="py-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                        The following required ingredient(s) for your order are low or out of stock:
                    </p>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-2 max-h-[180px] overflow-y-auto">
                        {outOfStockItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm font-medium">
                                <span className="text-foreground flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    {item.ingredient_name}
                                </span>
                                <span className="text-red-500 text-xs font-semibold">
                                    Req: {item.required_qty} {item.uom_name} | Avail: {item.available_qty} {item.uom_name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Would you like to cancel or proceed with cashier stock override to complete the payment?
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel Order
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onConfirmOverride();
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        <ShieldAlert className="w-4 h-4 mr-2" /> Proceed with Override
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
