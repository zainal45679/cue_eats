import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router, Link, usePage } from "@inertiajs/react";
import { Building2, Calendar, MapPin, Truck, CheckCircle2, XCircle, FileText, Printer, ShieldCheck, Mail, Phone, Clock, Users, Package } from "lucide-react";
import { toast } from "sonner";

export default function ShowPage({ purchaseOrder, canApprove, workflow }: { purchaseOrder: any, canApprove: boolean, workflow: string }) {
    const totalOrdered = purchaseOrder.items?.reduce((acc: number, item: any) => acc + Number(item.quantity || 0), 0) || 0;
    const totalReceived = purchaseOrder.items?.reduce((acc: number, item: any) => acc + Number(item.received_quantity || 0), 0) || 0;
    const totalRejected = purchaseOrder.items?.reduce((acc: number, item: any) => acc + Number(item.rejected_quantity || 0), 0) || 0;
    const totalPending = Math.max(0, totalOrdered - totalReceived - totalRejected);

    const hasRemainingItems = totalPending > 0;

    const handleApprove = () => {
        router.get(`/purchasing/purchase-orders/${purchaseOrder.uuid}/approve`);
    };

    const handleSubmitForApproval = () => {
        toast("Confirm Submission", {
            description: "Are you sure you want to submit this purchase order for approval?",
            action: {
                label: "Submit",
                onClick: () => router.post(`/purchasing/purchase-orders/${purchaseOrder.uuid}/submit`),
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    const handleReject = () => {
        toast("Confirm Reject", {
            description: "Are you sure you want to reject this purchase order?",
            action: {
                label: "Reject",
                onClick: () => router.post(`/purchasing/purchase-orders/${purchaseOrder.uuid}/reject`),
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'approved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 print:bg-transparent print:border print:border-slate-400 print:text-slate-800 print:shadow-none">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive" className="print:bg-transparent print:border print:border-slate-400 print:text-slate-800 print:shadow-none">Rejected</Badge>;
            case 'ordered': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 print:bg-transparent print:border print:border-slate-400 print:text-slate-800 print:shadow-none">Ordered</Badge>;
            case 'partially_received': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 print:bg-transparent print:border print:border-slate-400 print:text-slate-800 print:shadow-none">Partially Received</Badge>;
            case 'received': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 print:bg-transparent print:border print:border-slate-400 print:text-slate-800 print:shadow-none">Fully Received</Badge>;
            default: return <Badge variant="outline" className="print:border-slate-400 print:text-slate-800 print:shadow-none">{status}</Badge>;
        }
    };

    return (
        <XPage title={`Purchase Order ${purchaseOrder.po_number}`} backUrl="/purchasing/purchase-orders">
            {/* --- PRINT ONLY VIEW --- */}
            <div className="hidden print:block w-full bg-white text-black font-sans print:p-10 print:pb-24 relative min-h-screen">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-light text-orange-800 mb-6 uppercase tracking-wide">PURCHASE ORDER</h1>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-700">PO No</span>
                            <span className="text-slate-900 font-medium">{purchaseOrder.po_number}</span>
                            
                            <span className="font-semibold text-slate-700">Order Date</span>
                            <span className="text-slate-900 font-medium">{new Date(purchaseOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-3xl font-extrabold tracking-tighter text-slate-900 flex items-center">
                            <div className="bg-orange-100 text-orange-600 p-2 rounded-sm mr-2 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                                <Package className="w-6 h-6" />
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
                    <div className="bg-orange-50/50 p-5 rounded-md border border-orange-100 print:bg-orange-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-orange-100">
                        <h3 className="text-lg text-orange-800 mb-3 font-medium">Supplier Details</h3>
                        <div className="font-bold text-slate-900 text-base">{purchaseOrder.supplier?.name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {purchaseOrder.supplier?.contact_name && <div>Contact: {purchaseOrder.supplier.contact_name}</div>}
                            {purchaseOrder.supplier?.email && <div>Email: {purchaseOrder.supplier.email}</div>}
                            {purchaseOrder.supplier?.phone && <div>Phone: {purchaseOrder.supplier.phone}</div>}
                        </div>
                    </div>
                    
                    <div className="bg-orange-50/50 p-5 rounded-md border border-orange-100 print:bg-orange-50 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact] print:border-orange-100">
                        <h3 className="text-lg text-orange-800 mb-3 font-medium">Delivery Location</h3>
                        <div className="font-bold text-slate-900 text-base">{purchaseOrder.delivery_location?.location_name}</div>
                        <div className="text-sm text-slate-700 mt-2 space-y-1">
                            {purchaseOrder.delivery_location?.address && <div>{purchaseOrder.delivery_location.address}</div>}
                            <div className="mt-2 text-slate-900 font-medium pt-2 border-t border-orange-200">
                                Expected Delivery: {purchaseOrder.expected_delivery_date 
                                    ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : 'TBD'}
                            </div>
                        </div>
                    </div>
                </div>

                {purchaseOrder.notes && (
                    <div className="mb-8 text-sm text-slate-700">
                        <span className="font-bold block mb-1 text-slate-800">Notes:</span>
                        {purchaseOrder.notes}
                    </div>
                )}

                <div className="mb-8 overflow-hidden rounded-md border border-orange-200 print:border-orange-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-orange-100 text-orange-900 print:bg-orange-100 print:text-orange-900 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Ingredient</th>
                                <th className="py-3 px-4 font-semibold text-center">UOM</th>
                                <th className="py-3 px-4 font-semibold text-right">Ordered Qty</th>
                                <th className="py-3 px-4 font-semibold text-right">Received Qty</th>
                                <th className="py-3 px-4 font-semibold text-right">Rejected Qty</th>
                                <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                                <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-100">
                            {purchaseOrder.items?.map((item: any, index: number) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-orange-50/30 print:bg-orange-50/50 print:[color-adjust:exact]"}>
                                    <td className="py-3 px-4 text-slate-900">{item.ingredient?.name}</td>
                                    <td className="py-3 px-4 text-slate-600 text-center">{item.unit_of_measure?.name || '-'}</td>
                                    <td className="py-3 px-4 text-slate-900 text-right">{Number(item.quantity).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-emerald-700 font-semibold text-right">{Number(item.received_quantity || 0).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-red-600 font-semibold text-right">{Number(item.rejected_quantity || 0).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-slate-600 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-slate-900 font-medium text-right">
                                        ${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mb-12">
                    <div className="w-72">
                        <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-orange-200">
                            <span>Amount</span>
                            <span>${Number(purchaseOrder.grand_total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-3 text-lg font-bold text-orange-900 border-b-2 border-orange-300 print:border-orange-300">
                            <span>Total (USD)</span>
                            <span>${Number(purchaseOrder.grand_total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-10 left-0 w-full text-center text-xs text-orange-900/60 font-medium">
                    This is an electronically generated document, no signature is required.
                </div>
            </div>

            {/* --- WEB ONLY VIEW --- */}
            <div className="print:hidden">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">{purchaseOrder.po_number}</h1>
                            <div className="shrink-0">
                                {getStatusBadge(purchaseOrder.status)}
                            </div>
                        </div>
                        {purchaseOrder.approvals?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {purchaseOrder.status === 'approved' || purchaseOrder.status === 'received' || purchaseOrder.status === 'partially_received' || purchaseOrder.status === 'fully_received' ? 'Approved by ' : 'Reviewed by '}
                                <span className="font-semibold text-foreground">{purchaseOrder.approvals[purchaseOrder.approvals.length - 1].approver?.name || 'Unknown User'}</span>
                                {' on '}
                                {new Date(purchaseOrder.approvals[purchaseOrder.approvals.length - 1].created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        )}
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

                {/* Mobile Floating Action Bar */}
                <div className="fixed sm:hidden bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-md border-t border-border z-50 flex gap-2">
                    {workflow !== 'incoming' && purchaseOrder.status === 'draft' && (
                        <>
                            <Button variant="outline" className="flex-1 bg-background" asChild>
                                <Link href={`/purchasing/purchase-orders/${purchaseOrder.uuid}/edit`}>Edit</Link>
                            </Button>
                            <Button onClick={handleSubmitForApproval} className="flex-1 bg-blue-600 hover:bg-blue-700">Submit</Button>
                        </>
                    )}
                    
                    {workflow === 'incoming' && (purchaseOrder.status === 'approved' || purchaseOrder.status === 'partially_received') && hasRemainingItems && (
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                            <Link href={`/purchasing/grns/create?po_id=${purchaseOrder.id}`}>
                                <CheckCircle2 className="mr-2 size-5" /> Receive Items
                            </Link>
                        </Button>
                    )}
                    
                    {workflow !== 'incoming' && canApprove && (purchaseOrder.status === 'draft' || purchaseOrder.status === 'pending_approval') && (
                        <>
                            <Button variant="destructive" onClick={handleReject} className="flex-1">
                                Reject
                            </Button>
                            <Button onClick={handleApprove} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                Approve
                            </Button>
                        </>
                    )}
                </div>

                {/* Desktop Action Bar */}
                <div className="hidden sm:flex items-center flex-wrap gap-3 mb-8">
                    {workflow !== 'incoming' && purchaseOrder.status === 'draft' && (
                        <Button variant="outline" asChild>
                            <Link href={`/purchasing/purchase-orders/${purchaseOrder.uuid}/edit`}>Edit Order</Link>
                        </Button>
                    )}
                    
                    {workflow === 'incoming' && (purchaseOrder.status === 'approved' || purchaseOrder.status === 'partially_received') && hasRemainingItems && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                            <Link href={`/purchasing/grns/create?po_id=${purchaseOrder.id}`}>
                                <CheckCircle2 className="mr-2 size-4" /> Receive Items
                            </Link>
                        </Button>
                    )}
                    
                    {workflow !== 'incoming' && purchaseOrder.status === 'draft' && (
                        <Button onClick={handleSubmitForApproval} className="bg-blue-600 hover:bg-blue-700">
                            Submit for Approval
                        </Button>
                    )}
                    
                    {workflow !== 'incoming' && canApprove && (purchaseOrder.status === 'draft' || purchaseOrder.status === 'pending_approval') && (
                        <>
                            <Button variant="destructive" onClick={handleReject}>
                                <XCircle className="mr-2 size-4" /> Reject
                            </Button>
                            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle2 className="mr-2 size-4" /> Approve
                            </Button>
                        </>
                    )}
                </div>

                {purchaseOrder.status === 'partially_received' && totalPending > 0 && (
                    <div className="mb-8 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-100 dark:bg-purple-900/50 p-2.5 rounded-full shrink-0">
                                <Package className="size-5 text-purple-700 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-purple-900 dark:text-purple-300">Partially Received</h3>
                                <p className="text-sm text-purple-700 dark:text-purple-400/80 mt-1">
                                    You have received some items, but are still waiting for <strong className="font-bold">{totalPending.toFixed(2)} pending items</strong> from this order.
                                </p>
                            </div>
                        </div>
                        {workflow === 'incoming' && (
                            <Link href={`/purchasing/grns/create?po_id=${purchaseOrder.id}`}>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm shrink-0">
                                    Receive Pending Items
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-8 bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b md:border-b-0 md:border-r border-border/50">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Supplier</h3>
                        </div>
                        <div className="font-semibold text-foreground text-base mb-1">{purchaseOrder.supplier?.name}</div>
                        <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
                            {purchaseOrder.supplier?.contact_name && <span>{purchaseOrder.supplier.contact_name}</span>}
                            {purchaseOrder.supplier?.phone && <span>{purchaseOrder.supplier.phone}</span>}
                            {purchaseOrder.supplier?.email && <span>{purchaseOrder.supplier.email}</span>}
                        </div>
                    </div>

                    <div className="p-4 border-b md:border-b-0 md:border-r border-border/50">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Delivery</h3>
                        </div>
                        <div className="font-semibold text-foreground text-base mb-1">{purchaseOrder.delivery_location?.location_name || 'Main Kitchen'}</div>
                        {purchaseOrder.delivery_location?.address && <div className="text-sm text-muted-foreground">{purchaseOrder.delivery_location.address}</div>}
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Order Info</h3>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold text-right">{new Date(purchaseOrder.created_at).toLocaleDateString()}</span>
                            
                            <span className="text-muted-foreground">Expected:</span>
                            <span className="font-semibold text-right">
                                {purchaseOrder.expected_delivery_date 
                                    ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()
                                    : 'TBD'}
                            </span>

                            <span className="text-muted-foreground">Req. By:</span>
                            <span className="font-semibold text-right truncate">{purchaseOrder.created_by?.name || '-'}</span>
                        </div>
                    </div>
                </div>

                {purchaseOrder.notes && (
                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="size-4" /> Order Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{purchaseOrder.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="mb-8 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                    <div className="rounded-md border bg-card overflow-x-auto w-full">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                    <th className="h-10 px-4 text-right font-medium">Ordered Qty</th>
                                    <th className="h-10 px-4 text-right font-medium text-emerald-600">Received Qty</th>
                                    <th className="h-10 px-4 text-right font-medium text-red-600">Rejected Qty</th>
                                    <th className="h-10 px-4 text-right font-medium text-purple-600">Pending Qty</th>
                                    <th className="h-10 px-4 text-left font-medium">UOM</th>
                                    <th className="h-10 px-4 text-right font-medium">Unit Price</th>
                                    <th className="h-10 px-4 text-right font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrder.items?.map((item: any) => (
                                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{item.ingredient?.name}</td>
                                        <td className="p-4 text-right">{Number(item.quantity).toFixed(2)}</td>
                                        <td className="p-4 text-right font-semibold text-emerald-600">{Number(item.received_quantity || 0).toFixed(2)}</td>
                                        <td className="p-4 text-right font-semibold text-red-600">{Number(item.rejected_quantity || 0).toFixed(2)}</td>
                                        <td className="p-4 text-right font-semibold text-purple-600">
                                            {Math.max(0, Number(item.quantity) - Number(item.received_quantity || 0) - Number(item.rejected_quantity || 0)).toFixed(2)}
                                        </td>
                                        <td className="p-4">{item.unit_of_measure?.name || '-'}</td>
                                        <td className="p-4 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                        <td className="p-4 text-right font-medium">
                                            ${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/50 border-t">
                                <tr>
                                    <td colSpan={7} className="p-4 text-right font-bold text-lg">Grand Total</td>
                                    <td className="p-4 text-right font-bold text-lg text-primary">
                                        ${Number(purchaseOrder.grand_total).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        </XPage>
    );
}
