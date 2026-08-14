import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Input } from '@/components/shadcn/ui/input';
import { Users, UserCircle } from 'lucide-react';

export function DineInTopBar({ table, waiters, waiterId, setWaiterId, pax, setPax }: any) {
    if (!table) return null;

    return (
        <div className="flex items-center gap-4 p-3 bg-card border-b shadow-sm w-full shrink-0">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold">
                {table.name}
            </div>
            
            <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
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
        </div>
    );
}
