import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Input } from '@/components/shadcn/ui/input';
import { Users, UserCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { router } from '@inertiajs/react';

export function DineInTopBar({ table, waiters, waiterId, setWaiterId, pax, setPax, activeOrder, isWaiter }: any) {
    if (!table) return null;

    const currentWaiterName = waiters?.find((w: any) => w.id === waiterId)?.name || 'Unknown Waiter';

    return (
        <div className="flex items-center gap-4 p-3 bg-card border-b shadow-sm w-full shrink-0">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold">
                {table.name}
            </div>
            
            <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                {isWaiter ? (
                    <div className="flex items-center h-8 px-3 text-sm font-medium bg-muted/50 rounded-md text-foreground">
                        {currentWaiterName}
                    </div>
                ) : (
                    <Select value={waiterId} onValueChange={setWaiterId}>
                        <SelectTrigger className="w-[180px] h-8 text-sm bg-muted/50 border-transparent">
                            <SelectValue placeholder="Assign Waiter" />
                        </SelectTrigger>
                        <SelectContent>
                            {waiters?.map((w: any) => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Input 
                    type="number" 
                    min={1} 
                    className="w-20 h-8 text-sm bg-muted/50 border-transparent" 
                    value={pax} 
                    onChange={e => setPax(e.target.value)} 
                    placeholder="Pax"
                />
            </div>

            {activeOrder && activeOrder.status === 'draft' && (
                <div className="ml-auto">
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 rounded-full px-4 text-xs font-semibold"
                        onClick={() => {
                            router.post('/menu-pos/terminal/checkout', {
                                action: 'cancel_draft',
                                order_id: activeOrder.id,
                                order_type: 'Dine-in'
                            });
                        }}
                    >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Cancel / Free Table
                    </Button>
                </div>
            )}
        </div>
    );
}
