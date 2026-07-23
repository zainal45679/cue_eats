import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { router } from "@inertiajs/react";
import { MapPin, CheckCircle2, XCircle, Printer } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function ShowInternalRequestPage({ internalRequest, canApprove, canFulfill }: { internalRequest: any, canApprove: boolean, canFulfill: boolean }) {
    const handleApprove = () => {
        if (confirm("Are you sure you want to approve this indent and generate a Stock Transfer Order (STO)?")) {
            router.post(`/purchasing/internal-requests/${internalRequest.uuid}/approve`);
        }
    };

    const handleReject = () => {
        if (confirm("Are you sure you want to reject this indent?")) {
            router.post(`/purchasing/internal-requests/${internalRequest.uuid}/reject`);
        }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="size-4" /> Requesting Location (To)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-semibold text-lg">{internalRequest.to_location?.location_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {internalRequest.to_location?.address && <div>{internalRequest.to_location.address}</div>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="size-4" /> Fulfilling Location (From)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-semibold text-lg">{internalRequest.from_location?.location_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {internalRequest.from_location?.address && <div>{internalRequest.from_location.address}</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requested Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
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
                </CardContent>
            </Card>
        </XPage>
    );
}
