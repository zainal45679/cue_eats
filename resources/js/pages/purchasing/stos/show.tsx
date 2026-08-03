import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router, Link, usePage } from "@inertiajs/react";
import { MapPin, CheckCircle2, Truck, Printer } from "lucide-react";
import { toast } from "sonner";

export default function ShowStoPage(props: { sto: any, canDispatch: boolean, canReceive: boolean, workflow: string }) {
    const { sto, canDispatch, canReceive, workflow } = props;

    const hasRemainingItems = sto.items?.some((item: any) => {
        const expected = Number(item.dispatched_quantity) || 0;
        const received = Number(item.received_quantity) || 0;
        const rejected = Number(item.rejected_quantity) || 0;
        return expected - received - rejected > 0;
    });

    const handleDispatch = () => {
        toast("Confirm Dispatch", {
            description: "Are you sure you want to dispatch this STO? This will deduct the items from your inventory.",
            action: {
                label: "Dispatch",
                onClick: () => router.post(`/purchasing/stos/${sto.uuid}/dispatch`),
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
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
            {/* --- PRINT ONLY VIEW --- */}
            <div className="hidden print:block w-full bg-white text-black font-sans print:p-10 print:pb-24 relative min-h-screen">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-light text-purple-800 mb-6 uppercase tracking-wide">STOCK TRANSFER</h1>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-700">STO No</span>
                            <span className="text-slate-900 font-medium">{sto.sto_number}</span>
                            
                            <span className="font-semibold text-slate-700">Date</span>
                            <span className="text-slate-900 font-medium">{new Date(sto.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-3xl font-extrabold tracking-tighter text-slate-900 flex items-center">
                            <div className="bg-purple-100 text-purple-600 p-2 rounded-sm mr-2 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                                <Truck className="w-6 h-6" />
                            </div>
                            CUE EATS
                        </div>
                        <div className="text-sm text-slate-500 mt-4 text-right">
                            123 Restaurant Way<br />
                            Dubai, United Arab Emirates<br />
                            contact@cue-eats.com
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-purple-50/50 p-5 rounded-md border border-purple-100 print:bg-purple-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-purple-100">
                        <h3 className="text-lg text-purple-800 mb-3 font-medium">Dispatching Location (From)</h3>
                        <div className="font-bold text-slate-900 text-base">{sto.from_location?.location_name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {sto.from_location?.address && <div>{sto.from_location.address}</div>}
                        </div>
                    </div>
                    
                    <div className="bg-purple-50/50 p-5 rounded-md border border-purple-100 print:bg-purple-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-purple-100">
                        <h3 className="text-lg text-purple-800 mb-3 font-medium">Receiving Location (To)</h3>
                        <div className="font-bold text-slate-900 text-base">{sto.to_location?.location_name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {sto.to_location?.address && <div>{sto.to_location.address}</div>}
                            <div className="mt-2 text-slate-900 font-medium pt-2 border-t border-purple-200">
                                Status: {sto.status.replace('_', ' ').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 overflow-hidden rounded-md border border-purple-200 print:border-purple-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-purple-100 text-purple-900 print:bg-purple-100 print:text-purple-900 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Ingredient</th>
                                <th className="py-3 px-4 font-semibold text-center">UOM</th>
                                <th className="py-3 px-4 font-semibold text-right">Approved Qty</th>
                                <th className="py-3 px-4 font-semibold text-right">Dispatched Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                            {sto.items?.map((item: any, index: number) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-purple-50/30 print:bg-purple-50/50 print:[color-adjust:exact]"}>
                                    <td className="py-3 px-4 text-slate-900">{item.ingredient?.name}</td>
                                    <td className="py-3 px-4 text-slate-600 text-center">{item.unit_of_measure?.name || '-'}</td>
                                    <td className="py-3 px-4 text-slate-900 text-right">{Number(item.approved_quantity).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-purple-700 font-medium text-right">{sto.status !== 'pending_dispatch' ? Number(item.dispatched_quantity).toFixed(2) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="fixed bottom-10 left-0 w-full text-center text-xs text-purple-900/60 font-medium">
                    This is an electronically generated document, no signature is required.
                </div>
            </div>

            {/* --- WEB ONLY VIEW --- */}
            <div className="print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{sto.sto_number}</h1>
                        {getStatusBadge(sto.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 size-4" /> Print
                        </Button>
                        
                        {workflow === 'incoming' && canReceive && ['dispatched', 'partially_received'].includes(sto.status) && hasRemainingItems && (
                            <Link href={`/purchasing/grns/create?sto_id=${sto.id}`}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle2 className="mr-2 size-4" /> Receive Items (GRN)
                                </Button>
                            </Link>
                        )}

                        {workflow !== 'incoming' && canDispatch && sto.status === 'pending_dispatch' && (
                            <>
                                <Button variant="destructive" onClick={() => {
                                    toast("Confirm Reject", {
                                        description: "Are you sure you want to reject this STO?",
                                        action: {
                                            label: "Reject",
                                            onClick: () => router.post(`/purchasing/stos/${sto.uuid}/reject`),
                                        },
                                        cancel: { label: "Cancel", onClick: () => {} }
                                    });
                                }}>
                                    Reject
                                </Button>
                                <Button onClick={handleDispatch} className="bg-blue-600 hover:bg-blue-700">
                                    <Truck className="mr-2 size-4" /> Dispatch Items
                                </Button>
                            </>
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

                <div className="mb-8 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Transfer Items</h3>
                    <div className="rounded-md border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                    <th className="h-10 px-4 text-right font-medium">Approved Qty</th>
                                    {sto.status !== 'pending_dispatch' && (
                                        <>
                                            <th className="h-10 px-4 text-right font-medium">Dispatched Qty</th>
                                            <th className="h-10 px-4 text-right font-medium">Received Qty</th>
                                            <th className="h-10 px-4 text-right font-medium">Rejected Qty</th>
                                        </>
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
                                            <>
                                                <td className="p-4 text-right font-semibold">{Number(item.dispatched_quantity).toFixed(2)}</td>
                                                <td className="p-4 text-right font-semibold text-emerald-600">{Number(item.received_quantity || 0).toFixed(2)}</td>
                                                <td className="p-4 text-right font-semibold text-red-600">{Number(item.rejected_quantity || 0).toFixed(2)}</td>
                                            </>
                                        )}
                                        <td className="p-4">{item.unit_of_measure?.name || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </XPage>
    );
}
