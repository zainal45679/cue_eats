import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router } from "@inertiajs/react";
import { Building2, Calendar, MapPin, Truck, CheckCircle2, XCircle, FileText, Printer, ShieldCheck, Mail, Phone, Clock, Users, Package } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function ShowPage({ purchaseOrder, canApprove }: { purchaseOrder: any, canApprove: boolean }) {
    const handleApprove = () => {
        if (confirm("Are you sure you want to approve this Purchase Order?")) {
            router.post(`/purchasing/purchase-orders/${purchaseOrder.uuid}/approve`);
        }
    };

    const handleReject = () => {
        if (confirm("Are you sure you want to reject this Purchase Order?")) {
            router.post(`/purchasing/purchase-orders/${purchaseOrder.uuid}/reject`);
        }
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
                                    <td className="py-3 px-4 text-slate-900 text-right">{Number(item.received_quantity || 0).toFixed(2)}</td>
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
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">PO-{purchaseOrder.po_number}</h1>
                        {getStatusBadge(purchaseOrder.status)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 size-4" /> Print
                        </Button>
                        
                        {purchaseOrder.status === 'draft' && (
                            <Link href={`/purchasing/purchase-orders/${purchaseOrder.uuid}/edit`}>
                                <Button variant="outline">Edit Order</Button>
                            </Link>
                        )}
                        
                        {(purchaseOrder.status === 'approved' || purchaseOrder.status === 'partially_received') && (
                            <Link href={`/purchasing/grns/create?po_id=${purchaseOrder.id}`}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <CheckCircle2 className="mr-2 size-4" /> Receive Items
                                </Button>
                            </Link>
                        )}
                        
                        {canApprove && purchaseOrder.status === 'draft' && (
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Building2 className="size-4" /> Supplier Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{purchaseOrder.supplier?.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {purchaseOrder.supplier?.contact_name && <div>Contact: {purchaseOrder.supplier.contact_name}</div>}
                                {purchaseOrder.supplier?.email && <div>Email: {purchaseOrder.supplier.email}</div>}
                                {purchaseOrder.supplier?.phone && <div>Phone: {purchaseOrder.supplier.phone}</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="size-4" /> Delivery Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{purchaseOrder.delivery_location?.location_name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {purchaseOrder.delivery_location?.address && <div>{purchaseOrder.delivery_location.address}</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="size-4" /> Order Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Order Date:</span>
                                <span className="font-medium">{new Date(purchaseOrder.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Expected Delivery:</span>
                                <span className="font-medium">
                                    {purchaseOrder.expected_delivery_date 
                                        ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()
                                        : 'TBD'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
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
                    <div className="rounded-md border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                    <th className="h-10 px-4 text-right font-medium">Ordered Qty</th>
                                    <th className="h-10 px-4 text-right font-medium text-emerald-600">Received Qty</th>
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
                                        <td className="p-4 text-right text-emerald-600">{Number(item.received_quantity || 0).toFixed(2)}</td>
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
                                    <td colSpan={5} className="p-4 text-right font-bold text-lg">Grand Total</td>
                                    <td className="p-4 text-right font-bold text-lg text-primary">
                                        ${Number(purchaseOrder.grand_total).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {purchaseOrder.approvals?.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Approval History</h3>
                        <div className="space-y-4">
                            {purchaseOrder.approvals.map((approval: any) => (
                                <div key={approval.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                                    <div>
                                        <div className="font-medium">{approval.approver?.name || 'Unknown User'}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(approval.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1">
                                        {getStatusBadge(approval.status)}
                                        {approval.comments && (
                                            <div className="text-sm mt-2 italic">"{approval.comments}"</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </XPage>
    );
}
