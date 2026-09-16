import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Input } from '@/components/shadcn/ui/input';
import { Users, UserCircle, XCircle, LayoutGrid, ShoppingBag, ClipboardList, UtensilsCrossed, Search, X, ChefHat, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function DineInTopBar({ 
    table, 
    waiters, 
    waiterId, 
    setWaiterId, 
    pax, 
    setPax, 
    activeOrder, 
    isWaiter,
    searchQuery,
    setSearchQuery,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    runningOrders = [],
    onOpenRunningOrders,
    onNewOrder,
}: any) {
    const handleBackClick = () => {
        router.get('/menu-pos/tables');
    };

    const currentWaiterName = waiters?.find((w: any) => w.id === waiterId)?.name || 'Unknown Waiter';
    const readyCount = runningOrders?.filter((o: any) => o.kitchen_status === 'ready').length || 0;

    return (
        <div className="bg-background border-b p-3 space-y-3 shadow-sm z-10 shrink-0">
            {/* Row 1: Mode Switch, Table Info, Order Status & Search */}
            <div className="flex items-center justify-between">
                {/* Left Section: Mode Switch / Table Context */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex items-center p-0.5 bg-muted/60 border border-border/60 rounded-lg shadow-2xs">
                        <button
                            type="button"
                            onClick={handleBackClick}
                            className={cn(
                                "relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer select-none",
                                table ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                            )}
                            title="Floor Tables (Dine-In)"
                        >
                            {table && (
                                <motion.span
                                    layoutId="pos-top-mode-pill"
                                    className="absolute inset-0 rounded-md bg-background shadow-xs"
                                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                />
                            )}
                            <LayoutGrid className={cn("w-3.5 h-3.5 relative z-10", table ? "text-primary" : "")} />
                            <span className="relative z-10">Dine-In</span>
                        </button>
                        <button
                            type="button"
                            onClick={table ? () => router.get('/menu-pos/terminal') : undefined}
                            className={cn(
                                "relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors select-none",
                                !table ? "text-foreground font-bold cursor-default" : "text-muted-foreground hover:text-foreground cursor-pointer"
                            )}
                            title="Takeaway"
                        >
                            {!table && (
                                <motion.span
                                    layoutId="pos-top-mode-pill"
                                    className="absolute inset-0 rounded-md bg-background shadow-xs"
                                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                />
                            )}
                            <ShoppingBag className={cn("w-3.5 h-3.5 relative z-10", !table ? "text-primary" : "")} />
                            <span className="relative z-10">Takeaway</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.get('/menu-pos/live-orders')}
                            className="relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer select-none"
                            title="Live Orders"
                        >
                            <ClipboardList className="w-3.5 h-3.5 relative z-10" />
                            <span className="relative z-10">Live Orders</span>
                        </button>
                    </div>

                    {/* Running Orders Drawer Trigger */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onOpenRunningOrders}
                        className={cn(
                            "h-8 text-xs font-semibold rounded-lg px-2.5 gap-1.5 cursor-pointer shadow-2xs transition-all",
                            readyCount > 0 
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 animate-pulse" 
                                : "border-border/70 bg-background text-foreground hover:bg-muted"
                        )}
                        title="View running orders across dining floor and takeaway"
                    >
                        {readyCount > 0 ? (
                            <Bell className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                        ) : (
                            <ChefHat className="w-3.5 h-3.5 text-primary" />
                        )}
                        <span>Active</span>
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "h-4 min-w-4 px-1 text-[10px] font-bold rounded-full",
                                readyCount > 0 
                                    ? "bg-emerald-600 text-white" 
                                    : "bg-primary/15 text-primary"
                            )}
                        >
                            {runningOrders?.length || 0}
                        </Badge>
                        {readyCount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {readyCount} Ready!
                            </span>
                        )}
                    </Button>

                    {table && (
                        <>
                            <Badge variant="secondary" className="h-8 px-3 text-xs font-bold rounded-full bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                <span>{table.name}</span>
                            </Badge>

                            <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-full px-2.5 h-8">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                <input 
                                    type="number" 
                                    min={1} 
                                    className="w-10 text-xs bg-transparent border-none text-center font-semibold text-foreground focus:outline-hidden" 
                                    value={pax} 
                                    onChange={e => setPax(e.target.value)} 
                                    placeholder="Pax"
                                    title="Guest Pax"
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                {isWaiter ? (
                                    <div className="flex items-center h-8 px-3 text-xs font-medium bg-muted/50 rounded-full text-foreground border border-border/50">
                                        <UserCircle className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
                                        {currentWaiterName}
                                    </div>
                                ) : (
                                    <Select value={waiterId} onValueChange={setWaiterId}>
                                        <SelectTrigger className="w-[130px] h-8 text-xs bg-muted/50 border-border/50 rounded-full focus:ring-0">
                                            <SelectValue placeholder="Waiter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {waiters?.map((w: any) => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {!activeOrder && (
                                <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3.5 rounded-full font-semibold shadow-xs"
                                    onClick={() => {
                                        router.post('/menu-pos/terminal/occupy-table', {
                                            table_id: table.id
                                        });
                                    }}
                                >
                                    Occupy
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Right Section: Status Badges, Release Table & Menu Search */}
                <div className="flex items-center gap-2.5">
                    {activeOrder && (
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono font-bold text-xs bg-muted/50 h-8 px-2.5 rounded-full border-border/50">
                                {activeOrder.order_number}
                            </Badge>
                            <Badge className={cn(
                                "text-xs h-8 px-3 rounded-full font-medium shadow-2xs",
                                activeOrder.kitchen_status === 'ready' ? 'bg-emerald-600 text-white' :
                                activeOrder.status === 'billed' ? 'bg-amber-500 text-white' :
                                activeOrder.status === 'Completed' ? 'bg-emerald-600 text-white' :
                                'bg-blue-600 text-white'
                            )}>
                                {activeOrder.kitchen_status === 'ready' ? 'Ready!' :
                                 activeOrder.status === 'billed' ? 'Billed' : activeOrder.status || 'Running'}
                            </Badge>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full cursor-pointer"
                                onClick={onNewOrder}
                                title="Clear current order and start a new ticket"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                New Order
                            </Button>
                        </div>
                    )}

                    {activeOrder && activeOrder.status === 'draft' && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 rounded-full px-3 text-xs font-semibold"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to cancel and free this table?")) {
                                    router.post('/menu-pos/terminal/checkout', {
                                        action: 'cancel_draft',
                                        order_id: activeOrder.id,
                                        order_type: 'Dine-in'
                                    });
                                }
                            }}
                        >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Release
                        </Button>
                    )}

                    {/* Search bar on the right side */}
                    <div className="relative w-64 sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input 
                            id="pos-menu-search"
                            placeholder="Search menu items... (/)" 
                            className="pl-8 pr-8 h-8 bg-muted/50 border-border/50 focus-visible:bg-background focus-visible:border-primary rounded-full text-xs w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                                type="button"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Category Navigation Pills */}
            <div className="flex items-center justify-between w-full mb-1">
                <div className="flex-1 overflow-x-auto no-scrollbar">
                    <div className="flex space-x-2 pb-1 items-center">
                        <motion.button 
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "relative rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center select-none border outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                                activeCategoryId === 'all'
                                    ? "border-transparent text-primary-foreground font-semibold"
                                    : "border-border/70 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                            onClick={() => setActiveCategoryId('all')}
                        >
                            {activeCategoryId === 'all' && (
                                <motion.span
                                    layoutId="pos-category-pill"
                                    className="absolute inset-0 rounded-full bg-primary shadow-xs"
                                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                />
                            )}
                            <span className="relative z-10">All Items</span>
                        </motion.button>
                        {categories?.map((cat: any) => {
                            const isActive = activeCategoryId === cat.id;
                            return (
                                <motion.button 
                                    key={cat.id}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "relative rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center select-none border outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                                        isActive
                                            ? "border-transparent text-primary-foreground font-semibold"
                                            : "border-border/70 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                    onClick={() => setActiveCategoryId(cat.id)}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="pos-category-pill"
                                            className="absolute inset-0 rounded-full bg-primary shadow-xs"
                                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                        />
                                    )}
                                    <span className="relative z-10">{cat.name}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
