import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router } from "@inertiajs/react";
import { Building2, Calendar, MapPin, Truck, CheckCircle2, XCircle, FileText, ArrowLeft, Printer } from "lucide-react";
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
            case 'draft': return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Draft</Badge>;
            case 'approved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            case 'ordered': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Ordered</Badge>;
            case 'partially_received': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Partially Received</Badge>;
            case 'received': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Fully Received</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <XPage title={`Purchase Order ${purchaseOrder.po_number}`} backUrl="/purchasing/purchase-orders">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{purchaseOrder.po_number}</h1>
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

            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium">Ingredient</th>
                                    <th className="h-10 px-4 text-right font-medium">Qty</th>
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
                                    <td colSpan={4} className="p-4 text-right font-bold text-lg">Grand Total</td>
                                    <td className="p-4 text-right font-bold text-lg text-primary">
                                        ${Number(purchaseOrder.grand_total).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

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
        </XPage>
    );
}
