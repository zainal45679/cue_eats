import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router, Link } from "@inertiajs/react";
import { MapPin, CheckCircle2, Truck, Printer } from "lucide-react";

export default function ShowStoPage({ sto, canDispatch, canReceive }: { sto: any, canDispatch: boolean, canReceive: boolean }) {
    const handleDispatch = () => {
        if (confirm("Are you sure you want to dispatch this STO? This will deduct the items from your inventory.")) {
            router.post(`/purchasing/stos/${sto.uuid}/dispatch`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_dispatch': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending Dispatch</Badge>;
            case 'dispatched': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Dispatched</Badge>;
            case 'partially_received': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Partially Received</Badge>;
            case 'received': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Received</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <XPage title={`STO ${sto.sto_number}`} backUrl="/purchasing/stos">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{sto.sto_number}</h1>
                    {getStatusBadge(sto.status)}
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 size-4" /> Print
                    </Button>
                    
                    {canReceive && sto.status === 'dispatched' && (
                        <Link href={`/purchasing/grns/create?sto_id=${sto.id}`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle2 className="mr-2 size-4" /> Receive Items (GRN)
                            </Button>
                        </Link>
                    )}

                    {canDispatch && sto.status === 'pending_dispatch' && (
                        <Button onClick={handleDispatch} className="bg-blue-600 hover:bg-blue-700">
                            <Truck className="mr-2 size-4" /> Dispatch Items
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="size-4" /> Dispatching Location (From)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-semibold text-lg">{sto.from_location?.location_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {sto.from_location?.address && <div>{sto.from_location.address}</div>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="size-4" /> Receiving Location (To)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-semibold text-lg">{sto.to_location?.location_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {sto.to_location?.address && <div>{sto.to_location.address}</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                    <th className="h-10 px-4 text-right font-medium">Approved Qty</th>
                                    {sto.status !== 'pending_dispatch' && (
                                        <th className="h-10 px-4 text-right font-medium">Dispatched Qty</th>
                                    )}
                                    <th className="h-10 px-4 text-left font-medium">UOM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sto.items?.map((item: any) => (
                                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{item.ingredient?.name}</td>
                                        <td className="p-4 text-right font-semibold">{Number(item.approved_quantity).toFixed(2)}</td>
                                        {sto.status !== 'pending_dispatch' && (
                                            <td className="p-4 text-right font-semibold">{Number(item.dispatched_quantity).toFixed(2)}</td>
                                        )}
                                        <td className="p-4">{item.unit_of_measure?.name || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </XPage>
    );
}
