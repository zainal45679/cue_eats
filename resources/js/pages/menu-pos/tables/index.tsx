import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { XPage } from '@/components/x/page/XPage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/shadcn/ui/tabs';
import { Users, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TablesScreen({ zones }: { zones: any[] }) {
    const [activeZone, setActiveZone] = useState(zones.length > 0 ? zones[0].id : null);

    const getTableColorClass = (table: any) => {
        if (!table.active_order) return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900'; // Available
        if (table.active_order.status === 'billed') return 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900'; // Billed
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900'; // Occupied/Running
    };

    const handleTableClick = (table: any) => {
        router.visit(`/menu-pos/terminal?table_id=${table.id}`);
    };

    return (
        <XPage 
            title="Dine-In Tables" 
            fullWidth={true}
            headerAction={
                <button 
                    onClick={() => router.visit('/menu-pos')} 
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                    Back to POS
                </button>
            }
        >
            <Head title="Tables" />
            
            {zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                    <p className="text-lg">No Dining Zones Found</p>
                    <p className="text-sm">Please set up your dining zones and tables in the admin panel.</p>
                </div>
            ) : (
                <div className="flex flex-col h-[calc(100vh-140px)]">
                    <Tabs value={activeZone} onValueChange={setActiveZone} className="w-full">
                        <TabsList className="flex flex-wrap h-auto mb-6 bg-transparent gap-2 justify-start w-full">
                            {zones.map((zone) => (
                                <TabsTrigger 
                                    key={zone.id} 
                                    value={zone.id}
                                    className="px-6 py-3 text-sm rounded-full data-[state=active]:bg-black data-[state=active]:text-white bg-gray-100 border border-transparent shadow-none hover:bg-gray-200"
                                >
                                    {zone.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        <div className="flex-1 p-2 overflow-y-auto">
                            {zones.map((zone) => (
                                <TabsContent key={zone.id} value={zone.id} className="mt-0">
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                                        {zone.tables?.map((table: any) => (
                                            <div 
                                                key={table.id}
                                                onClick={() => handleTableClick(table)}
                                                className={cn(
                                                    "relative flex flex-col items-center justify-center p-4 border rounded-xl shadow-sm cursor-pointer transition-all aspect-square",
                                                    getTableColorClass(table)
                                                )}
                                            >
                                                <div className="text-xl font-bold">{table.name}</div>
                                                <div className="flex items-center gap-1 mt-2 text-sm opacity-70">
                                                    <Users size={14} /> {table.active_order?.pax || table.seating_capacity}
                                                </div>
                                                {table.active_order && (
                                                    <div className="flex items-center gap-1 mt-3 font-semibold">
                                                        <ReceiptText size={14} /> 
                                                        ₹{Number(table.active_order.grand_total).toFixed(2)}
                                                    </div>
                                                )}
                                                {table.active_order?.status === 'billed' && (
                                                    <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 text-xs text-white bg-blue-600 rounded-full animate-pulse">
                                                        ₹
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            )}
        </XPage>
    );
}
