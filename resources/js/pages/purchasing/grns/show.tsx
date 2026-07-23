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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{grn.grn_number}</h1>
                    {getStatusBadge(grn.status)}
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 size-4" /> Print
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ClipboardCheck className="size-4" /> Receipt Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Source STO:</span>
                                <span className="font-medium">{grn.stock_transfer_order?.sto_number || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Received By:</span>
                                <span className="font-medium">{grn.received_by?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium">{new Date(grn.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="size-4" /> Receiving Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-semibold text-lg">{grn.location?.location_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {grn.location?.address && <div>{grn.location.address}</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {grn.remarks && (
                <Card className="mb-6 bg-muted/20">
                    <CardContent className="pt-6">
                        <h4 className="text-sm font-medium mb-1">Remarks:</h4>
                        <p className="text-sm text-muted-foreground">{grn.remarks}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Received Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
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
                                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
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
                </CardContent>
            </Card>
        </XPage>
    );
}
