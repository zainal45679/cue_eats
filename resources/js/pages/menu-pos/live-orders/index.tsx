import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Eye, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn/ui/dialog';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';

export default function LiveOrdersScreen({ orders }: { orders: any[] }) {
    const [viewOrder, setViewOrder] = useState<any | null>(null);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['orders'], preserveState: true, preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'preparing': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'ready': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'rejected': return 'bg-red-500 hover:bg-red-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getElapsedTime = (createdAt: string) => {
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffInMinutes = Math.floor((now - start) / 60000);
        return `${diffInMinutes} min`;
    };

    return (
        <div className="p-4 md:p-6 w-full">
            <Head title="Live Orders Management" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Orders</h1>
                    <p className="text-muted-foreground mt-1">Monitor all active orders and kitchen status</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.reload({ only: ['orders'] })}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Time Elapsed</TableHead>
                                <TableHead>Kitchen Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No active orders found for today.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.order_number}</TableCell>
                                        <TableCell>{order.order_type}</TableCell>
                                        <TableCell>{order.customer_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {getElapsedTime(order.created_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(order.kitchen_status)}>
                                                {order.kitchen_status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${parseFloat(order.grand_total).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setViewOrder(order)}>
                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Order Dialog */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Order Details: {viewOrder?.order_number}</DialogTitle>
                    </DialogHeader>
                    {viewOrder && (
                        <div className="py-4">
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Customer</span>
                                    <span className="font-medium">{viewOrder.customer_name || 'Walk-in'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Type</span>
                                    <span className="font-medium">{viewOrder.order_type}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Cashier</span>
                                    <span className="font-medium">{viewOrder.cashier?.name || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Status</span>
                                    <Badge className={getStatusColor(viewOrder.kitchen_status)}>
                                        {viewOrder.kitchen_status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            
                            <h4 className="font-semibold mb-2 border-b pb-2">Items</h4>
                            <ScrollArea className="max-h-[300px]">
                                <ul className="space-y-3">
                                    {viewOrder.items?.map((item: any) => (
                                        <li key={item.id} className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium">{item.quantity}x {item.menu_item?.name}</span>
                                                {item.modifiers?.length > 0 && (
                                                    <div className="text-sm text-muted-foreground pl-4">
                                                        {item.modifiers.map((mod: any, idx: number) => (
                                                            <div key={idx}>+ {mod.modifier?.name}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.notes && (
                                                    <div className="text-sm text-muted-foreground pl-4 italic">Note: {item.notes}</div>
                                                )}
                                            </div>
                                            <span className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>

                            <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${parseFloat(viewOrder.grand_total).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
