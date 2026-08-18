import React, { useState } from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { router } from "@inertiajs/react";
import { MapPin, Save, AlertCircle, Package, Warehouse } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { Badge } from "@/components/shadcn/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/ui/select";

export default function FulfillInternalRequestPage({
    internalRequest,
    storageLocations = [],
}: {
    internalRequest: any;
    storageLocations?: any[];
}) {
    const title = `Fulfill Request: ${internalRequest.request_number}`;
    const sourceName = internalRequest.from_location?.location_name;
    const destName = internalRequest.to_location?.location_name;

    const [items, setItems] = useState(
        internalRequest.items.map((item: any) => {
            const requested = Number(item.quantity) || 0;
            const dispatched = Number(item.dispatched_quantity) || 0;
            const rejected = Number(item.rejected_quantity) || 0;
            const pending = Math.max(0, requested - dispatched - rejected);

            const storageStockMap = item.storage_stock || {};
            // Pick initial storage location with highest available stock
            let defaultStorageId = storageLocations.length > 0 ? storageLocations[0].id : '';
            let maxStock = -1;
            storageLocations.forEach((loc) => {
                const stock = Number(storageStockMap[loc.id]) || 0;
                if (stock > maxStock) {
                    maxStock = stock;
                    defaultStorageId = loc.id;
                }
            });

            const initialLiveStock = maxStock >= 0 ? maxStock : (Number(item.live_stock) || 0);

            return {
                id: item.id,
                ingredient_id: item.ingredient_id,
                ingredient_name: item.ingredient?.name,
                uom_name: item.unit_of_measure?.name,
                requested_quantity: requested,
                pending_quantity: pending,
                storage_stock: storageStockMap,
                from_storage_location_id: defaultStorageId,
                live_stock: initialLiveStock,
                dispatch_quantity: pending > initialLiveStock ? initialLiveStock : pending,
                reject_quantity: 0,
            };
        }).filter((item: any) => item.pending_quantity > 0)
    );

    const [error, setError] = useState<string | null>(null);

    const handleStorageChange = (index: number, storageId: string) => {
        const newItems = [...items];
        const item = newItems[index];
        item.from_storage_location_id = storageId;
        const availableInStorage = Number(item.storage_stock[storageId]) || 0;
        item.live_stock = availableInStorage;
        if (item.dispatch_quantity > availableInStorage) {
            item.dispatch_quantity = availableInStorage;
        }
        setItems(newItems);
        setError(null);
    };

    const handleQuantityChange = (index: number, field: 'dispatch_quantity' | 'reject_quantity', value: string) => {
        const val = Number(value) || 0;
        const newItems = [...items];
        newItems[index][field] = val;
        setItems(newItems);
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate
        for (const item of items) {
            if (item.dispatch_quantity > item.live_stock) {
                setError(`Cannot dispatch more ${item.ingredient_name} (${item.dispatch_quantity}) than available in selected storage (${item.live_stock}).`);
                return;
            }
            
            const total = Number((item.dispatch_quantity + item.reject_quantity).toFixed(2));
            const pending = Number(item.pending_quantity.toFixed(2));
            
            if (total > pending) {
                setError(`Total dispatch (${item.dispatch_quantity}) and reject (${item.reject_quantity}) for ${item.ingredient_name} cannot exceed the pending amount (${item.pending_quantity}).`);
                return;
            }
        }
        
        const hasDispatched = items.some(i => i.dispatch_quantity > 0);
        const confirmMsg = hasDispatched 
            ? "Fulfill this request? A new STO will be generated for the dispatched items."
            : "No items dispatched. Are you sure you want to proceed? (Only rejections will be recorded)";

        if (confirm(confirmMsg)) {
            router.post(`/purchasing/internal-requests/${internalRequest.uuid}/fulfill`, {
                items: items.map(item => ({
                    id: item.id,
                    dispatch_quantity: item.dispatch_quantity,
                    reject_quantity: item.reject_quantity,
                    from_storage_location_id: item.from_storage_location_id,
                }))
            });
        }
    };

    return (
        <XPage title="Fulfill Internal Request" backUrl="/purchasing/internal-requests">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Requesting Location (To)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{destName}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="size-4" /> Destination
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Dispatching From</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{sourceName}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <Warehouse className="size-4" /> Your Location
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border-2 border-primary/10 shadow-sm p-0 gap-0">
                    <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="size-5 text-primary" /> Fulfill Items
                        </CardTitle>
                    </div>
                    <div className="bg-card">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Ingredient</TableHead>
                                        <TableHead className="w-[200px]">Source Storage Location</TableHead>
                                        <TableHead className="text-center">Pending Qty</TableHead>
                                        <TableHead className="text-center">Storage Stock</TableHead>
                                        <TableHead className="text-center">Dispatch Now</TableHead>
                                        <TableHead className="text-center">Permanently Reject</TableHead>
                                        <TableHead className="text-right">UOM</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item: any, index: number) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                                            
                                            {/* Source Storage Location Selector */}
                                            <TableCell>
                                                {storageLocations.length > 0 ? (
                                                    <Select
                                                        value={item.from_storage_location_id}
                                                        onValueChange={(val) => handleStorageChange(index, val)}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue placeholder="Select Storage" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {storageLocations.map((loc) => {
                                                                const stock = Number(item.storage_stock[loc.id]) || 0;
                                                                return (
                                                                    <SelectItem key={loc.id} value={loc.id}>
                                                                        {loc.storage_name} ({stock} {item.uom_name})
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Default Storage</span>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <span className="font-bold text-base text-primary/80">{item.pending_quantity}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={item.live_stock < item.pending_quantity ? 'text-red-500 border-red-200' : 'text-emerald-500 border-emerald-200'}>
                                                    {item.live_stock} {item.uom_name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.01"
                                                    max={Math.min(item.pending_quantity, item.live_stock)}
                                                    value={item.dispatch_quantity}
                                                    onChange={(e) => handleQuantityChange(index, 'dispatch_quantity', e.target.value)}
                                                    className="w-28 text-center mx-auto focus-visible:ring-emerald-500"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.01"
                                                    max={item.pending_quantity}
                                                    value={item.reject_quantity}
                                                    onChange={(e) => handleQuantityChange(index, 'reject_quantity', e.target.value)}
                                                    className="w-28 text-center mx-auto focus-visible:ring-red-500"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.uom_name}</TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                No pending items to fulfill for this request.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>
                
                {internalRequest.stos && internalRequest.stos.length > 0 && (
                    <div className="mb-8 mt-8">
                        <h3 className="text-lg font-semibold mb-4">Fulfillment History</h3>
                        <div className="space-y-4">
                            {internalRequest.stos.map((sto: any) => (
                                <div key={sto.id} className="rounded-md border bg-card p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <span className="font-semibold text-base">{sto.sto_number}</span>
                                            <span className="ml-4 text-sm text-muted-foreground">
                                                Created on {new Date(sto.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Badge variant={
                                            sto.status === 'received' ? 'success' :
                                            sto.status === 'partially_received' ? 'warning' :
                                            sto.status === 'dispatched' ? 'default' :
                                            'secondary'
                                        }>
                                            {sto.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/30 text-muted-foreground">
                                            <tr>
                                                <th className="h-8 px-4 text-left font-medium">Ingredient</th>
                                                <th className="h-8 px-4 text-right font-medium">Approved Qty</th>
                                                <th className="h-8 px-4 text-right font-medium">Dispatched Qty</th>
                                                <th className="h-8 px-4 text-right font-medium">Received Qty</th>
                                                <th className="h-8 px-4 text-right font-medium">Rejected Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sto.items?.map((item: any) => (
                                                <tr key={item.id} className="border-t hover:bg-muted/10 transition-colors">
                                                    <td className="p-2 px-4">{item.ingredient?.name}</td>
                                                    <td className="p-2 px-4 text-right font-semibold text-blue-600">{Number(item.approved_quantity || 0).toFixed(2)}</td>
                                                    <td className="p-2 px-4 text-right font-semibold text-emerald-600">{Number(item.dispatched_quantity || 0).toFixed(2)}</td>
                                                    <td className="p-2 px-4 text-right font-semibold text-emerald-600">{Number(item.received_quantity || 0).toFixed(2)}</td>
                                                    <td className="p-2 px-4 text-right font-semibold text-red-600">{Number(item.rejected_quantity || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {items.length > 0 && (
                    <div className="flex justify-end pt-4 pb-12 gap-3">
                        <Button 
                            type="submit" 
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                        >
                            <Save className="mr-2 size-5" /> Confirm Fulfillment
                        </Button>
                    </div>
                )}
            </form>
        </XPage>
    );
}
