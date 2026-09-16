import React, { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/shadcn/ui/sheet';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
    Clock, 
    Search, 
    X, 
    Utensils, 
    ShoppingBag, 
    ChefHat, 
    Bell, 
    ArrowRight, 
    CheckCircle2, 
    Plus,
    User
} from 'lucide-react';

interface ActiveOrdersSheetProps {
    isOpen: boolean;
    onClose: () => void;
    runningOrders: any[];
    currentOrderId?: string;
    onSelectOrder: (orderId: string) => void;
    onNewOrder: () => void;
}

export function ActiveOrdersSheet({
    isOpen,
    onClose,
    runningOrders = [],
    currentOrderId,
    onSelectOrder,
    onNewOrder,
}: ActiveOrdersSheetProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'takeaway' | 'dine-in' | 'ready'>('all');
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    const getElapsedTime = (dateString: string) => {
        if (!dateString) return 'Just now';
        const start = new Date(dateString).getTime();
        const diffMins = Math.floor((now.getTime() - start) / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins >= 60) {
            const hrs = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${hrs}h ${mins}m ago`;
        }
        return `${diffMins}m ago`;
    };

    const takeawayOrders = useMemo(() => 
        runningOrders.filter(o => !o.dining_table_id && o.order_type !== 'Dine-in'),
        [runningOrders]
    );

    const dineInOrders = useMemo(() => 
        runningOrders.filter(o => o.dining_table_id || o.order_type === 'Dine-in'),
        [runningOrders]
    );

    const readyOrders = useMemo(() => 
        runningOrders.filter(o => o.kitchen_status === 'ready'),
        [runningOrders]
    );

    const filteredOrders = useMemo(() => {
        let list = runningOrders;

        if (filterTab === 'takeaway') {
            list = takeawayOrders;
        } else if (filterTab === 'dine-in') {
            list = dineInOrders;
        } else if (filterTab === 'ready') {
            list = readyOrders;
        }

        if (!searchQuery.trim()) return list;

        const q = searchQuery.toLowerCase().trim();
        return list.filter(o => {
            const orderNum = (o.order_number || '').toLowerCase();
            const table = (o.dining_table?.name || o.diningTable?.name || '').toLowerCase();
            const cust = (o.customer_name || '').toLowerCase();
            const waiter = (o.waiter?.name || '').toLowerCase();
            const items = (o.items || []).map((i: any) => (i.menu_item?.name || i.name || '')).join(' ').toLowerCase();

            return orderNum.includes(q) || table.includes(q) || cust.includes(q) || waiter.includes(q) || items.includes(q);
        });
    }, [runningOrders, filterTab, searchQuery, takeawayOrders, dineInOrders, readyOrders]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-background border-l z-50">
                {/* Drawer Header */}
                <SheetHeader className="p-4 border-b bg-card shrink-0 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                <ChefHat className="w-4 h-4" />
                            </div>
                            <div>
                                <SheetTitle className="text-base font-bold text-foreground">Running Orders</SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                    {runningOrders.length} active ticket{runningOrders.length === 1 ? '' : 's'} in progress
                                </SheetDescription>
                            </div>
                        </div>

                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                            onClick={() => {
                                onNewOrder();
                                onClose();
                            }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Order</span>
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search by order #, table, guest, or item..."
                            className="pl-8 pr-8 h-8 text-xs rounded-lg bg-muted/50 border-border/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Navigation Pills */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setFilterTab('all')}
                            className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer shrink-0",
                                filterTab === 'all'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All ({runningOrders.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('takeaway')}
                            className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer shrink-0 flex items-center gap-1",
                                filterTab === 'takeaway'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Takeaway ({takeawayOrders.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('dine-in')}
                            className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer shrink-0 flex items-center gap-1",
                                filterTab === 'dine-in'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Utensils className="w-3.5 h-3.5" />
                            <span>Dine-In ({dineInOrders.length})</span>
                        </button>
                        {readyOrders.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setFilterTab('ready')}
                                className={cn(
                                    "px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer shrink-0 flex items-center gap-1",
                                    filterTab === 'ready'
                                        ? "bg-emerald-600 text-white"
                                        : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/25 animate-pulse"
                                )}
                            >
                                <Bell className="w-3.5 h-3.5" />
                                <span>Ready ({readyOrders.length})</span>
                            </button>
                        )}
                    </div>
                </SheetHeader>

                {/* Orders List Body */}
                <ScrollArea className="flex-1 p-3.5 bg-muted/15 min-h-0">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                            <ChefHat className="w-12 h-12 mb-3 opacity-25" />
                            <p className="font-bold text-sm text-foreground">No active orders</p>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[240px]">
                                {searchQuery ? 'No orders match your search keyword.' : 'All kitchen tickets are settled and completed.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => {
                                const isCurrent = order.id === currentOrderId;
                                const isReady = order.kitchen_status === 'ready';
                                const isPreparing = order.kitchen_status === 'preparing';
                                const tableName = order.dining_table?.name || order.diningTable?.name;
                                const elapsedTime = getElapsedTime(order.created_at);
                                const itemCount = (order.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

                                return (
                                    <div
                                        key={order.id}
                                        className={cn(
                                            "bg-card rounded-xl border p-3.5 transition-all shadow-2xs relative flex flex-col gap-2.5",
                                            isCurrent ? "ring-2 ring-primary border-primary bg-primary/[0.02]" : "border-border/70 hover:border-border",
                                            isReady && "border-emerald-500/50 bg-emerald-500/[0.03]"
                                        )}
                                    >
                                        {/* Card Top: Order #, Table/Takeaway, Status, Time */}
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-sm font-mono text-foreground">
                                                        #{order.order_number}
                                                    </span>

                                                    {tableName ? (
                                                        <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
                                                            <Utensils className="w-2.5 h-2.5 mr-1" />
                                                            {tableName}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md">
                                                            <ShoppingBag className="w-2.5 h-2.5 mr-1" />
                                                            Takeaway
                                                        </Badge>
                                                    )}

                                                    {isCurrent && (
                                                        <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30">
                                                            Active Now
                                                        </span>
                                                    )}
                                                </div>

                                                {order.customer_name && order.customer_name !== 'Walk-in Customer' && (
                                                    <p className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">
                                                        {order.customer_name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                {/* Kitchen Cooking Status Badge */}
                                                {isReady ? (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs animate-pulse">
                                                        <Bell className="w-3 h-3" />
                                                        Ready for Pickup
                                                    </Badge>
                                                ) : isPreparing ? (
                                                    <Badge className="bg-blue-500/15 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                                        Cooking
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/15 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                                        Sent to Kitchen
                                                    </Badge>
                                                )}

                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    {elapsedTime}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items Preview */}
                                        <div className="bg-muted/40 rounded-lg p-2 text-xs space-y-1 border border-border/30">
                                            <div className="flex justify-between items-center text-muted-foreground font-medium text-[11px] mb-1">
                                                <span>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                                                <span className="font-extrabold text-foreground text-xs">
                                                    ₹{parseFloat(order.grand_total || '0').toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="space-y-0.5 max-h-[70px] overflow-y-auto pr-1">
                                                {(order.items || []).map((item: any) => (
                                                    <div key={item.id} className="flex justify-between text-xs leading-tight">
                                                        <span className={cn(
                                                            "truncate max-w-[280px]",
                                                            item.is_voided ? "line-through text-destructive opacity-70" : "text-foreground font-medium"
                                                        )}>
                                                            {item.quantity}x {item.menu_item?.name || item.name || 'Item'}
                                                        </span>
                                                        <span className="text-muted-foreground shrink-0 pl-2">
                                                            ₹{parseFloat(item.subtotal || '0').toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom Actions: Waiter info & Open Button */}
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                {order.waiter?.name && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {order.waiter.name}
                                                    </span>
                                                )}
                                            </div>

                                            {isCurrent ? (
                                                <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Currently Loaded</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-2xs"
                                                    onClick={() => {
                                                        onSelectOrder(order.id);
                                                        onClose();
                                                    }}
                                                >
                                                    <span>Open in POS</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
