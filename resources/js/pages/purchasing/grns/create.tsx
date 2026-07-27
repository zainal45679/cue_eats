import React, { useState } from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { router } from "@inertiajs/react";
import { MapPin, Save } from "lucide-react";

export default function CreateGrnPage({ sto, po }: { sto?: any, po?: any }) {
    const isPO = !!po;
    const document = isPO ? po : sto;
    const title = isPO ? `PO: ${po.po_number}` : `STO: ${sto.sto_number}`;
    const sourceName = isPO ? po.supplier?.name : sto.from_location?.location_name;
    const destName = isPO ? po.delivery_location?.location_name : sto.to_location?.location_name;

    const [remarks, setRemarks] = useState("");
    const [items, setItems] = useState(
        document.items.map((item: any) => {
            const expectedQty = isPO 
                ? Math.max(0, Number(item.quantity) - Number(item.received_quantity || 0))
                : Number(item.dispatched_quantity);
                
            return {
                ingredient_id: item.ingredient_id,
                ingredient_name: item.ingredient?.name,
                uom_id: isPO ? item.purchase_uom_id : item.uom_id,
                uom_name: item.unit_of_measure?.name,
                expected_quantity: expectedQty,
                received_quantity: expectedQty,
                rejected_quantity: 0,
            };
        }).filter((item: any) => item.expected_quantity > 0)
    );

    const handleQuantityChange = (index: number, field: 'received_quantity' | 'rejected_quantity', value: string) => {
        const val = Number(value) || 0;
        const newItems = [...items];
        newItems[index][field] = val;
        
        // Auto-balance received vs rejected based on expected
        if (field === 'received_quantity') {
            newItems[index].rejected_quantity = Math.max(0, newItems[index].expected_quantity - val);
        } else if (field === 'rejected_quantity') {
            newItems[index].received_quantity = Math.max(0, newItems[index].expected_quantity - val);
        }

        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (confirm("Submit Received Goods? This will update your location's inventory.")) {
            router.post("/purchasing/grns", {
                ...(isPO ? { po_id: document.id } : { sto_id: document.id }),
                remarks,
                items: items.map(item => ({
                    ingredient_id: item.ingredient_id,
                    expected_quantity: item.expected_quantity,
                    received_quantity: item.received_quantity,
                    rejected_quantity: item.rejected_quantity,
                    uom_id: item.uom_id,
                }))
            });
        }
    };

    return (
        <XPage title="Receive Goods (GRN)" backUrl={isPO ? "/purchasing/purchase-orders" : "/purchasing/stos"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Source</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{title}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="size-4" /> From: {sourceName}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Destination</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">Your Location</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="size-4" /> To: {destName}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Verify Receiving Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                All items from this order have already been fully received.
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                            <th className="h-10 px-4 text-right font-medium">Expected Qty</th>
                                            <th className="h-10 px-4 text-right font-medium">Received Qty</th>
                                            <th className="h-10 px-4 text-right font-medium">Rejected Qty</th>
                                            <th className="h-10 px-4 text-left font-medium">UOM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={index} className="border-t">
                                                <td className="p-4 font-medium">{item.ingredient_name}</td>
                                                <td className="p-4 text-right text-muted-foreground">{item.expected_quantity.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <div className="flex justify-end">
                                                        <Input 
                                                            type="number" 
                                                            step="0.01" 
                                                            min="0"
                                                            className="w-24 text-right" 
                                                            value={item.received_quantity}
                                                            onChange={(e) => handleQuantityChange(index, 'received_quantity', e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-end">
                                                        <Input 
                                                            type="number" 
                                                            step="0.01" 
                                                            min="0"
                                                            className="w-24 text-right text-red-600 font-medium" 
                                                            value={item.rejected_quantity}
                                                            onChange={(e) => handleQuantityChange(index, 'rejected_quantity', e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">{item.uom_name || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="text-sm font-medium mb-2 block">Remarks / Notes</label>
                            <Input 
                                placeholder="Enter any notes about the delivery or rejections..." 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={items.length === 0}>
                        <Save className="mr-2 size-4" /> Submit GRN & Update Inventory
                    </Button>
                </div>
            </form>
        </XPage>
    );
}
