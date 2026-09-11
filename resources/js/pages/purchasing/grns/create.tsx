import React, { useState } from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { router } from "@inertiajs/react";
import { MapPin, Save, Package, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/ui/alert";
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
                ? Math.max(0, Number(item.quantity) - Number(item.received_quantity || 0) - Number(item.rejected_quantity || 0))
                : Math.max(0, Number(item.dispatched_quantity) - Number(item.received_quantity || 0) - Number(item.rejected_quantity || 0));
                
            return {
                ingredient_id: item.ingredient_id,
                ingredient_name: item.ingredient?.name,
                is_perishable: !!item.ingredient?.is_perishable,
                shelf_life_days: item.ingredient?.shelf_life_days || null,
                storage_condition: item.ingredient?.storage_condition || null,
                uom_id: isPO ? item.purchase_uom_id : item.uom_id,
                uom_name: item.unit_of_measure?.name,
                expected_quantity: expectedQty,
                received_quantity: expectedQty,
                rejected_quantity: 0,
                pending_quantity: 0,
                batch_number: "",
                mfg_date: "",
                expiry_date: "",
            };
        }).filter((item: any) => item.expected_quantity > 0)
    );

    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = (index: number, field: 'received_quantity' | 'rejected_quantity', value: string) => {
        const val = Number(value) || 0;
        const newItems = [...items];
        newItems[index][field] = val;
        
        newItems[index].pending_quantity = Math.max(0, newItems[index].expected_quantity - newItems[index].received_quantity - newItems[index].rejected_quantity);

        setItems(newItems);
        setError(null);
    };

    const handleFieldChange = (index: number, field: 'batch_number' | 'mfg_date' | 'expiry_date', value: string) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-calculate expiry date if mfg_date is changed and item has shelf_life_days
        if (field === 'mfg_date' && value && newItems[index].shelf_life_days) {
            const mfg = new Date(value);
            if (!isNaN(mfg.getTime())) {
                mfg.setDate(mfg.getDate() + Number(newItems[index].shelf_life_days));
                newItems[index].expiry_date = mfg.toISOString().split('T')[0];
            }
        }

        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        for (const item of items) {
            if (item.received_quantity + item.rejected_quantity > item.expected_quantity) {
                setError(`Received and Rejected quantities for ${item.ingredient_name} cannot exceed Expected Quantity (${item.expected_quantity}).`);
                return;
            }
        }
        
        if (confirm("Submit Received Goods? This will update your location's inventory.")) {
            router.post("/purchasing/grns", {
                ...(isPO ? { po_id: document.id } : { sto_id: document.id }),
                remarks,
                items: items.map(item => ({
                    ingredient_id: item.ingredient_id,
                    expected_quantity: item.expected_quantity,
                    received_quantity: item.received_quantity,
                    rejected_quantity: item.rejected_quantity,
                    batch_number: item.batch_number || null,
                    mfg_date: item.mfg_date || null,
                    expiry_date: item.expiry_date || null,
                    uom_id: item.uom_id,
                }))
            });
        }
    };

    return (
        <XPage title="Receive Goods (GRN)" backUrl={isPO ? "/purchasing/purchase-orders" : "/purchasing/stos"}>
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

                <Card className="overflow-hidden border-2 border-primary/10 shadow-sm p-0 gap-0">
                    <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="size-5 text-primary" /> Verify Receiving Items
                        </CardTitle>
                    </div>
                    <div className="bg-card">
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                All items from this order have already been fully received.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Ingredient</TableHead>
                                            <TableHead className="text-right">Expected Qty</TableHead>
                                            <TableHead className="text-center">Received Qty</TableHead>
                                            <TableHead className="text-center">Rejected Qty</TableHead>
                                            <TableHead className="text-center">Batch / Lot #</TableHead>
                                            <TableHead className="text-center">Mfg &amp; Expiry Dates</TableHead>
                                            <TableHead className="text-right">UOM</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{item.ingredient_name}</span>
                                                        {item.is_perishable && (
                                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                                                                ⏳ Perishable {item.shelf_life_days ? `(${item.shelf_life_days}d shelf life)` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-bold text-base text-primary/80">{item.expected_quantity.toFixed(2)}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Input 
                                                        type="number" 
                                                        step="0.01" 
                                                        min="0"
                                                        className="w-24 text-center mx-auto focus-visible:ring-emerald-500" 
                                                        value={item.received_quantity}
                                                        onChange={(e) => handleQuantityChange(index, 'received_quantity', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Input 
                                                        type="number" 
                                                        step="0.01" 
                                                        min="0"
                                                        className="w-24 text-center mx-auto focus-visible:ring-red-500" 
                                                        value={item.rejected_quantity}
                                                        onChange={(e) => handleQuantityChange(index, 'rejected_quantity', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Input 
                                                        type="text" 
                                                        placeholder="Batch #" 
                                                        className="w-28 text-xs text-center mx-auto" 
                                                        value={item.batch_number}
                                                        onChange={(e) => handleFieldChange(index, 'batch_number', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-[9px] text-muted-foreground uppercase font-semibold">Mfg</span>
                                                            <Input 
                                                                type="date" 
                                                                className="w-32 h-8 text-xs px-2" 
                                                                value={item.mfg_date}
                                                                onChange={(e) => handleFieldChange(index, 'mfg_date', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-[9px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Expiry</span>
                                                            <Input 
                                                                type="date" 
                                                                className="w-32 h-8 text-xs px-2 border-amber-300 focus-visible:ring-amber-500" 
                                                                value={item.expiry_date}
                                                                onChange={(e) => handleFieldChange(index, 'expiry_date', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">{item.uom_name || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="px-6 py-4 border-t border-primary/10 bg-primary/5">
                            <label className="text-sm font-semibold mb-2 block text-primary">Remarks / Notes</label>
                            <Input 
                                placeholder="Enter any notes about the delivery or rejections..." 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                    </div>
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
