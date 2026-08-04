import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { MapPin, Printer, ClipboardCheck } from "lucide-react";

export default function ShowGrnPage({ grn }: { grn: any }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Draft</Badge>;
            case 'submitted': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Submitted</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <XPage title={`GRN ${grn.grn_number}`} backUrl="/purchasing/grns">
            {/* --- PRINT ONLY VIEW --- */}
            <div className="hidden print:block w-full bg-white text-black font-sans print:p-10 print:pb-24 relative min-h-screen">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-light text-emerald-800 mb-6 uppercase tracking-wide">RECEIVED GOODS</h1>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-700">GRN No</span>
                            <span className="text-slate-900 font-medium">{grn.grn_number}</span>
                            
                            <span className="font-semibold text-slate-700">Receipt Date</span>
                            <span className="text-slate-900 font-medium">{new Date(grn.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>

                            {grn.stock_transfer_order?.sto_number && (
                                <>
                                    <span className="font-semibold text-slate-700">Source STO</span>
                                    <span className="text-slate-900 font-medium">{grn.stock_transfer_order.sto_number}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-3xl font-extrabold tracking-tighter text-slate-900 flex items-center">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-sm mr-2 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                                <ClipboardCheck className="w-6 h-6" />
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
                    <div className="bg-emerald-50/50 p-5 rounded-md border border-emerald-100 print:bg-emerald-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-emerald-100">
                        <h3 className="text-lg text-emerald-800 mb-3 font-medium">Receiving Location</h3>
                        <div className="font-bold text-slate-900 text-base">{grn.location?.location_name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {grn.location?.address && <div>{grn.location.address}</div>}
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50/50 p-5 rounded-md border border-emerald-100 print:bg-emerald-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-emerald-100">
                        <h3 className="text-lg text-emerald-800 mb-3 font-medium">Receipt Details</h3>
                        <div className="text-sm text-slate-700 space-y-2">
                            <div><span className="font-semibold">Received By:</span> {grn.received_by?.name || '-'}</div>
                            <div><span className="font-semibold">Status:</span> {grn.status.replace('_', ' ').toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {grn.remarks && (
                    <div className="mb-8 text-sm text-slate-700">
                        <span className="font-bold block mb-1 text-slate-800">Remarks:</span>
                        {grn.remarks}
                    </div>
                )}

                <div className="mb-8 overflow-hidden rounded-md border border-emerald-200 print:border-emerald-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-emerald-100 text-emerald-900 print:bg-emerald-100 print:text-emerald-900 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Ingredient</th>
                                <th className="py-3 px-4 font-semibold text-center">UOM</th>
                                <th className="py-3 px-4 font-semibold text-right">Expected Qty</th>
                                <th className="py-3 px-4 font-semibold text-right">Received Qty</th>
                                <th className="py-3 px-4 font-semibold text-right">Rejected Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100">
                            {grn.items?.map((item: any, index: number) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-emerald-50/30 print:bg-emerald-50/50 print:[color-adjust:exact]"}>
                                    <td className="py-3 px-4 text-slate-900">{item.ingredient?.name}</td>
                                    <td className="py-3 px-4 text-slate-600 text-center">{item.unit_of_measure?.name || '-'}</td>
                                    <td className="py-3 px-4 text-slate-600 text-right">{Number(item.expected_quantity).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-emerald-700 font-medium text-right">{Number(item.received_quantity).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-red-600 font-medium text-right">{Number(item.rejected_quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="fixed bottom-10 left-0 w-full text-center text-xs text-emerald-900/60 font-medium">
                    This is an electronically generated document, no signature is required.
                </div>
            </div>

            {/* --- WEB ONLY VIEW --- */}
            <div className="print:hidden">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight truncate">{grn.grn_number}</h1>
                            <div className="shrink-0">
                                {getStatusBadge(grn.status)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="shrink-0 ml-4 hidden sm:flex items-center gap-2">
                        {/* Desktop only buttons */}
                        <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9">
                            <Printer className="mr-2 size-4" /> Print
                        </Button>
                    </div>
                    {/* Mobile Print Icon */}
                    <div className="shrink-0 ml-2 sm:hidden">
                        <Button variant="ghost" size="icon" onClick={() => window.print()} className="h-9 w-9 rounded-full bg-muted/50">
                            <Printer className="size-4 text-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-8 bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b md:border-b-0 md:border-r border-border/50">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <ClipboardCheck className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Receipt Details</h3>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm mt-3">
                            <span className="text-muted-foreground">Source STO:</span>
                            <span className="font-semibold text-right">{grn.stock_transfer_order?.sto_number || '-'}</span>
                            
                            <span className="text-muted-foreground">Received By:</span>
                            <span className="font-semibold text-right">{grn.received_by?.name || '-'}</span>
                            
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold text-right">{new Date(grn.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Receiving Location</h3>
                        </div>
                        <div className="font-semibold text-foreground text-base mb-1 mt-3">{grn.location?.location_name}</div>
                        {grn.location?.address && <div className="text-sm text-muted-foreground">{grn.location.address}</div>}
                    </div>
                </div>

                {grn.remarks && (
                    <div className="mb-6 bg-muted/20 border border-border/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Remarks</h4>
                        <p className="text-sm text-foreground">{grn.remarks}</p>
                    </div>
                )}

                <div className="mb-8 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Received Items</h3>
                    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                        <th className="h-10 px-4 text-right font-medium">Expected Qty</th>
                                        <th className="h-10 px-4 text-right font-medium text-emerald-700">Received Qty</th>
                                        <th className="h-10 px-4 text-right font-medium text-red-700">Rejected Qty</th>
                                        <th className="h-10 px-4 text-left font-medium">UOM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grn.items?.map((item: any) => (
                                        <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors whitespace-nowrap">
                                            <td className="p-4 font-medium">{item.ingredient?.name}</td>
                                            <td className="p-4 text-right font-semibold text-muted-foreground">{Number(item.expected_quantity).toFixed(2)}</td>
                                            <td className="p-4 text-right font-bold text-emerald-600">{Number(item.received_quantity).toFixed(2)}</td>
                                            <td className="p-4 text-right font-bold text-red-600">{Number(item.rejected_quantity).toFixed(2)}</td>
                                            <td className="p-4">{item.unit_of_measure?.name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </XPage>
    );
}
