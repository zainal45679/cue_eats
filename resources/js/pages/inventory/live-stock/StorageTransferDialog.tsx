import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/ui/select';
import { AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn/ui/alert';

interface StorageTransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    storageLocations: any[];
    inventoryBalances?: any[];
    preselectedBalance?: any;
}

export function StorageTransferDialog({
    open,
    onOpenChange,
    storageLocations,
    inventoryBalances = [],
    preselectedBalance,
}: StorageTransferDialogProps) {
    const [fromStorageId, setFromStorageId] = useState<string>('');
    const [toStorageId, setToStorageId] = useState<string>('');
    const [ingredientId, setIngredientId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract unique ingredients list from inventory balances
    const ingredientsMap = new Map();
    inventoryBalances.forEach((bal) => {
        if (bal.ingredient) {
            ingredientsMap.set(bal.ingredient.id, bal.ingredient);
        }
    });
    const ingredients = Array.from(ingredientsMap.values());

    useEffect(() => {
        if (preselectedBalance) {
            setFromStorageId(preselectedBalance.storage_location_id || '');
            setIngredientId(preselectedBalance.ingredient_id || '');
        } else if (storageLocations.length > 0) {
            if (!fromStorageId) setFromStorageId(storageLocations[0].id);
            if (!toStorageId && storageLocations.length > 1) setToStorageId(storageLocations[1].id);
        }
        setError(null);
    }, [preselectedBalance, open, storageLocations]);

    // Available stock for selected fromStorage and ingredient
    const selectedSourceBalance = inventoryBalances.find(
        (b) => b.storage_location_id === fromStorageId && b.ingredient_id === ingredientId
    );
    const availableStock = selectedSourceBalance ? Number(selectedSourceBalance.available_qty) || 0 : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const qtyNum = Number(quantity);
        if (qtyNum <= 0) {
            setError('Transfer quantity must be greater than zero.');
            return;
        }

        if (fromStorageId === toStorageId) {
            setError('Source and Destination storage locations cannot be the same.');
            return;
        }

        if (qtyNum > availableStock) {
            setError(`Cannot transfer ${qtyNum}. Only ${availableStock} is available in source storage.`);
            return;
        }

        setSubmitting(true);

        router.post(
            '/inventory/storage-transfers',
            {
                from_storage_location_id: fromStorageId,
                to_storage_location_id: toStorageId,
                ingredient_id: ingredientId,
                quantity: qtyNum,
            },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: (errs) => {
                    setSubmitting(false);
                    if (errs.quantity) setError(errs.quantity);
                    else if (errs.error) setError(errs.error);
                    else setError('Failed to complete storage transfer.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <ArrowRightLeft className="w-5 h-5 text-primary" /> Inter-Storage Stock Transfer
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Transfer Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* From Storage Location */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="from-storage" className="text-right font-medium">
                                From Storage
                            </Label>
                            <Select value={fromStorageId} onValueChange={setFromStorageId}>
                                <SelectTrigger className="col-span-3" id="from-storage">
                                    <SelectValue placeholder="Select Source Storage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {storageLocations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id}>
                                            {loc.storage_name} ({loc.storage_type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* To Storage Location */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="to-storage" className="text-right font-medium">
                                To Storage
                            </Label>
                            <Select value={toStorageId} onValueChange={setToStorageId}>
                                <SelectTrigger className="col-span-3" id="to-storage">
                                    <SelectValue placeholder="Select Destination Storage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {storageLocations
                                        .filter((loc) => loc.id !== fromStorageId)
                                        .map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.storage_name} ({loc.storage_type})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ingredient Selector */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ingredient-select" className="text-right font-medium">
                                Ingredient
                            </Label>
                            <Select value={ingredientId} onValueChange={setIngredientId}>
                                <SelectTrigger className="col-span-3" id="ingredient-select">
                                    <SelectValue placeholder="Select Ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ingredients.map((ing) => (
                                        <SelectItem key={ing.id} value={ing.id}>
                                            {ing.name} ({ing.base_uom?.code || ing.base_uom?.name || 'Unit'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Available Stock Display */}
                        {ingredientId && fromStorageId && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right text-xs text-muted-foreground">Source Stock:</span>
                                <div className="col-span-3 text-xs font-bold text-foreground">
                                    {availableStock} Available
                                </div>
                            </div>
                        )}

                        {/* Transfer Quantity */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="transfer-qty" className="text-right font-medium">
                                Quantity
                            </Label>
                            <Input
                                id="transfer-qty"
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !fromStorageId || !toStorageId || !ingredientId}>
                            <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Stock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
