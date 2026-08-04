import React, { useState } from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { router } from "@inertiajs/react";
import { MapPin, Save, AlertCircle, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";

export default function ApprovePurchaseOrderPage({ purchaseOrder }: { purchaseOrder: any }) {
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState(
        purchaseOrder.items.map((item: any) => ({
            id: item.id,
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient?.name,
            uom_name: item.unit_of_measure?.name,
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price) || 0,
        }))
    );

    const [error, setError] = useState<string | null>(null);

    const handleItemChange = (index: number, field: 'quantity' | 'unit_price', value: string) => {
        const val = Number(value) || 0;
        const newItems = [...items];
        newItems[index][field] = val;
        setItems(newItems);
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        for (const item of items) {
            if (item.quantity <= 0) {
                setError(`Quantity for ${item.ingredient_name} must be greater than 0.`);
                return;
            }
            if (item.unit_price < 0) {
                setError(`Unit price for ${item.ingredient_name} cannot be negative.`);
                return;
            }
        }
        
        if (confirm("Approve this Purchase Order and track the items as on-order?")) {
            router.post(`/purchasing/purchase-orders/${purchaseOrder.uuid}/approve`, {
                notes,
                items: items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                }))
            });
        }
    };

    const total = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

    return (
        <XPage title={`Approve PO: ${purchaseOrder.po_number}`} backUrl={`/purchasing/purchase-orders/${purchaseOrder.uuid}`}>
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
                            <CardTitle className="text-sm font-medium text-muted-foreground">Supplier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{purchaseOrder.supplier?.name}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{purchaseOrder.delivery_location?.location_name}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="size-4" /> Deliver to this location
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border-2 border-primary/10 shadow-sm p-0 gap-0">
                    <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="size-5 text-primary" /> Adjust Approved Quantities & Prices
                        </CardTitle>
                    </div>
                    <div className="bg-card">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Ingredient</TableHead>
                                        <TableHead className="text-right">Approved Qty</TableHead>
                                        <TableHead className="text-right">UOM</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Total Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                                            <TableCell className="text-right">
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0.01"
                                                    className="w-28 text-right ml-auto focus-visible:ring-emerald-500" 
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.uom_name || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0"
                                                    className="w-32 text-right ml-auto focus-visible:ring-emerald-500" 
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {(item.quantity * item.unit_price).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="px-6 py-4 border-t border-primary/10 bg-primary/5 flex justify-between items-center">
                            <div className="flex-1 mr-6">
                                <label className="text-sm font-semibold mb-2 block text-primary">Approval Notes (Optional)</label>
                                <Input 
                                    placeholder="Enter any notes about this approval..." 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="bg-background max-w-lg"
                                />
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">New Grand Total</div>
                                <div className="text-2xl font-bold text-primary">{total.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={() => router.get(`/purchasing/purchase-orders/${purchaseOrder.uuid}`)}>
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        <Save className="mr-2 size-4" /> Finalize Approval
                    </Button>
                </div>
            </form>
        </XPage>
    );
}
