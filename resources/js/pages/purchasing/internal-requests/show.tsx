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
                        <h1 className="text-4xl font-light text-blue-800 mb-6 uppercase tracking-wide">INTERNAL REQUEST</h1>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{internalRequest.request_number}</h1>
                        {getStatusBadge(internalRequest.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 size-4" /> Print
                        </Button>
                        
                        {internalRequest.status === 'draft' && (
                            <Link href={`/purchasing/internal-requests/${internalRequest.uuid}/edit`}>
                                <Button variant="outline">Edit Indent</Button>
                            </Link>
                        )}

                        {canApprove && internalRequest.status === 'draft' && (
                            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle2 className="mr-2 size-4" /> Approve & Generate STO
                            </Button>
                        )}

                        {canApprove && internalRequest.status === 'draft' && (
                            <Button variant="destructive" onClick={handleReject}>
                                <XCircle className="mr-2 size-4" /> Reject
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-start gap-12 text-sm mb-8 bg-muted/20 border p-4 rounded-md">
                    <div className="space-y-1">
                        <div className="text-muted-foreground font-semibold mb-1 uppercase text-[10px] tracking-wider">Requesting Location (To)</div>
                        <div className="font-semibold text-foreground text-base">{internalRequest.to_location?.location_name}</div>
                        {internalRequest.to_location?.address && <div className="text-muted-foreground">{internalRequest.to_location.address}</div>}
                    </div>

                    <div className="space-y-1">
                        <div className="text-muted-foreground font-semibold mb-1 uppercase text-[10px] tracking-wider">Fulfilling Location (From)</div>
                        <div className="font-semibold text-foreground text-base">{internalRequest.from_location?.location_name}</div>
                        {internalRequest.from_location?.address && <div className="text-muted-foreground">{internalRequest.from_location.address}</div>}
                    </div>
                </div>

                <div className="mb-8 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Requested Items</h3>
                    <div className="rounded-md border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                    <th className="h-10 px-4 text-right font-medium">Requested Qty</th>
                                    <th className="h-10 px-4 text-left font-medium">UOM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {internalRequest.items?.map((item: any) => (
                                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{item.ingredient?.name}</td>
                                        <td className="p-4 text-right font-semibold">{Number(item.quantity).toFixed(2)}</td>
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
