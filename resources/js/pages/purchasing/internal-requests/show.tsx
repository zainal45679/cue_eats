import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router } from "@inertiajs/react";
import { MapPin, CheckCircle2, XCircle, Printer } from "lucide-react";
import { Link } from "@inertiajs/react";
import { toast } from "sonner";

export default function ShowInternalRequestPage({ internalRequest, canApprove, canFulfill }: { internalRequest: any, canApprove: boolean, canFulfill: boolean }) {
    const handleApprove = () => {
        toast("Confirm Approval", {
            description: "Are you sure you want to approve this indent and generate a Stock Transfer Order (STO)?",
            action: {
                label: "Approve",
                onClick: () => router.post(`/purchasing/internal-requests/${internalRequest.uuid}/approve`),
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    const handleReject = () => {
        toast("Confirm Rejection", {
            description: "Are you sure you want to reject this indent?",
            action: {
                label: "Reject",
                onClick: () => router.post(`/purchasing/internal-requests/${internalRequest.uuid}/reject`),
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Draft</Badge>;
            case 'pending_fulfillment': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending Fulfillment</Badge>;
            case 'converted_to_sto': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Converted to STO</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <XPage title={`Indent ${internalRequest.request_number}`} backUrl="/purchasing/internal-requests">
            {/* --- PRINT ONLY VIEW --- */}
            <div className="hidden print:block w-full bg-white text-black font-sans print:p-10 print:pb-24 relative min-h-screen">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-light text-blue-800 mb-6 uppercase tracking-wide">REQUEST STOCK</h1>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-700">Request No</span>
                            <span className="text-slate-900 font-medium">{internalRequest.request_number}</span>
                            
                            <span className="font-semibold text-slate-700">Date</span>
                            <span className="text-slate-900 font-medium">{new Date(internalRequest.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-3xl font-extrabold tracking-tighter text-slate-900 flex items-center">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-sm mr-2 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                                <MapPin className="w-6 h-6" />
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
                    <div className="bg-blue-50/50 p-5 rounded-md border border-blue-100 print:bg-blue-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-blue-100">
                        <h3 className="text-lg text-blue-800 mb-3 font-medium">Requesting Location (To)</h3>
                        <div className="font-bold text-slate-900 text-base">{internalRequest.to_location?.location_name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {internalRequest.to_location?.address && <div>{internalRequest.to_location.address}</div>}
                        </div>
                    </div>
                    
                    <div className="bg-blue-50/50 p-5 rounded-md border border-blue-100 print:bg-blue-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-blue-100">
                        <h3 className="text-lg text-blue-800 mb-3 font-medium">Fulfilling Location (From)</h3>
                        <div className="font-bold text-slate-900 text-base">{internalRequest.from_location?.location_name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {internalRequest.from_location?.address && <div>{internalRequest.from_location.address}</div>}
                            <div className="mt-2 text-slate-900 font-medium pt-2 border-t border-blue-200">
                                Status: {internalRequest.status.replace('_', ' ').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 overflow-hidden rounded-md border border-blue-200 print:border-blue-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-blue-100 text-blue-900 print:bg-blue-100 print:text-blue-900 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Ingredient</th>
                                <th className="py-3 px-4 font-semibold text-center">UOM</th>
                                <th className="py-3 px-4 font-semibold text-right">Requested Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                            {internalRequest.items?.map((item: any, index: number) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30 print:bg-blue-50/50 print:[color-adjust:exact]"}>
                                    <td className="py-3 px-4 text-slate-900">{item.ingredient?.name}</td>
                                    <td className="py-3 px-4 text-slate-600 text-center">{item.unit_of_measure?.name || '-'}</td>
                                    <td className="py-3 px-4 text-slate-900 font-medium text-right">{Number(item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="fixed bottom-10 left-0 w-full text-center text-xs text-blue-900/60 font-medium">
                    This is an electronically generated document, no signature is required.
                </div>
            </div>

            {/* --- WEB ONLY VIEW --- */}
            <div className="print:hidden">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight truncate">{internalRequest.request_number}</h1>
                            <div className="shrink-0">
                                {getStatusBadge(internalRequest.status)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="shrink-0 ml-4 hidden sm:flex items-center gap-2">
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

                {/* Mobile Floating Action Bar */}
                <div className="fixed sm:hidden bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-md border-t border-border z-50 flex gap-2">
                    {internalRequest.status === 'draft' && (
                        <Button variant="outline" className="flex-1 bg-background" asChild>
                            <Link href={`/purchasing/internal-requests/${internalRequest.uuid}/edit`}>Edit</Link>
                        </Button>
                    )}

                    {canApprove && internalRequest.status === 'draft' && (
                        <Button onClick={() => {
                            if (confirm("Submit this Indent request?")) {
                                router.post(`/purchasing/internal-requests/${internalRequest.uuid}/approve`);
                            }
                        }} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            Submit
                        </Button>
                    )}

                    {canFulfill && ['pending_fulfillment', 'partially_fulfilled'].includes(internalRequest.status) && (
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                            <Link href={`/purchasing/internal-requests/${internalRequest.uuid}/fulfill`}>
                                <CheckCircle2 className="mr-2 size-5" /> Fulfill
                            </Link>
                        </Button>
                    )}

                    {canApprove && internalRequest.status === 'draft' && (
                        <Button variant="destructive" onClick={handleReject} className="flex-1">
                            Reject
                        </Button>
                    )}
                    {canFulfill && ['pending_fulfillment', 'partially_fulfilled'].includes(internalRequest.status) && (
                        <Button variant="destructive" onClick={handleReject} className="w-full mt-2">
                            Reject Remaining
                        </Button>
                    )}
                </div>

                {/* Desktop Action Bar */}
                <div className="hidden sm:flex items-center flex-wrap gap-3 mb-8">
                    {internalRequest.status === 'draft' && (
                        <Button variant="outline" asChild>
                            <Link href={`/purchasing/internal-requests/${internalRequest.uuid}/edit`}>Edit Indent</Link>
                        </Button>
                    )}

                    {canApprove && internalRequest.status === 'draft' && (
                        <Button onClick={() => {
                            if (confirm("Submit this Indent request?")) {
                                router.post(`/purchasing/internal-requests/${internalRequest.uuid}/approve`);
                            }
                        }} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="mr-2 size-4" /> Submit Indent
                        </Button>
                    )}

                    {canFulfill && ['pending_fulfillment', 'partially_fulfilled'].includes(internalRequest.status) && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                            <Link href={`/purchasing/internal-requests/${internalRequest.uuid}/fulfill`}>
                                <CheckCircle2 className="mr-2 size-4" /> Fulfill Request
                            </Link>
                        </Button>
                    )}

                    {canApprove && internalRequest.status === 'draft' && (
                        <Button variant="destructive" onClick={handleReject}>
                            <XCircle className="mr-2 size-4" /> Reject Indent
                        </Button>
                    )}

                    {canFulfill && ['pending_fulfillment', 'partially_fulfilled'].includes(internalRequest.status) && (
                        <Button variant="destructive" onClick={handleReject}>
                            <XCircle className="mr-2 size-4" /> Reject Remaining Request
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-8 bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b md:border-b-0 md:border-r border-border/50">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Requesting Location (To)</h3>
                        </div>
                        <div className="font-semibold text-foreground text-base mb-1 mt-3">{internalRequest.to_location?.location_name}</div>
                        {internalRequest.to_location?.address && <div className="text-sm text-muted-foreground">{internalRequest.to_location.address}</div>}
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Fulfilling Location (From)</h3>
                        </div>
                        <div className="font-semibold text-foreground text-base mb-1 mt-3">{internalRequest.from_location?.location_name}</div>
                        {internalRequest.from_location?.address && <div className="text-sm text-muted-foreground">{internalRequest.from_location.address}</div>}
                    </div>
                </div>

                <div className="mb-8 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Requested Items</h3>
                    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                        <th className="h-10 px-4 text-center font-medium">Requested</th>
                                        <th className="h-10 px-4 text-center font-medium text-emerald-600">Dispatched</th>
                                        <th className="h-10 px-4 text-center font-medium text-red-600">Rejected</th>
                                        <th className="h-10 px-4 text-center font-medium text-blue-600">Remaining</th>
                                        <th className="h-10 px-4 text-left font-medium">UOM</th>
                                        <th className="h-10 px-4 text-right font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {internalRequest.items?.map((item: any) => (
                                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{item.ingredient?.name}</td>
                                        <td className="p-4 text-center">{Number(item.quantity).toFixed(2)}</td>
                                        <td className="p-4 text-center text-emerald-600 font-semibold">{Number(item.dispatched_quantity).toFixed(2)}</td>
                                        <td className="p-4 text-center text-red-600 font-semibold">{Number(item.rejected_quantity).toFixed(2)}</td>
                                        <td className="p-4 text-center text-blue-600 font-semibold">{Number(item.remaining_quantity).toFixed(2)}</td>
                                        <td className="p-4">{item.unit_of_measure?.name || '-'}</td>
                                        <td className="p-4 text-right">
                                            <Badge variant={
                                                item.fulfillment_status === 'Fulfilled' ? 'success' :
                                                item.fulfillment_status === 'Pending Fulfillment' ? 'warning' :
                                                item.fulfillment_status === 'Rejected' ? 'destructive' :
                                                item.fulfillment_status === 'Partially Sent' ? 'secondary' :
                                                'secondary'
                                            }>
                                                {item.fulfillment_status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
            </div>
        </XPage>
    );
}
