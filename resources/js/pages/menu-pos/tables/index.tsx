import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import { ZoneFormDialog } from './ZoneFormDialog';
import { TableFormDialog } from './TableFormDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/shadcn/ui/dropdown-menu';
import { Settings, Plus, Pencil, Trash2, Edit, ArrowRight, Users, ReceiptText, Clock, User, ArrowLeft, Lock, LayoutGrid, ShoppingBag, ClipboardList } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';

const getMergeSpan = (tableName: string) => {
    if (!tableName) return "col-span-2 sm:col-span-2 md:col-span-2";
    const matches = tableName.match(/\d+/g);
    if (!matches || matches.length < 2) return "col-span-2 sm:col-span-2 md:col-span-2";
    
    if (matches.length >= 3) {
        return "col-span-2 sm:col-span-2 md:col-span-2 row-span-2 sm:row-span-2 md:row-span-2 min-h-[204px]";
    }
    
    const diff = Math.abs(parseInt(matches[0]) - parseInt(matches[1]));
    return diff === 1 
        ? "col-span-2 sm:col-span-2 md:col-span-2"
        : "row-span-2 sm:row-span-2 md:row-span-2 min-h-[204px]";
}

export default function TablesScreen({ zones = [] }: { zones?: any[] }) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const isAllOutlets = auth?.active_location_id === null;
    const allLocations = auth?.all_business_locations || [];
    const [selectedLocationId, setSelectedLocationId] = useState(
        isAllOutlets ? (allLocations[0]?.id || null) : auth?.active_location_id
    );
    
    const visibleZones = zones.filter((z: any) => z.business_location_id === selectedLocationId);
    
    const [activeZone, setActiveZone] = useState(visibleZones.length > 0 ? visibleZones[0].id : null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [mergeMode, setMergeMode] = useState(false);
    const [selectedTablesToMerge, setSelectedTablesToMerge] = useState<string[]>([]);

    const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [selectedZoneForTable, setSelectedZoneForTable] = useState<string>('');


    useEffect(() => {
        if (visibleZones.length > 0 && !visibleZones.find((z: any) => z.id === activeZone)) {
            setActiveZone(visibleZones[0].id);
        }
    }, [selectedLocationId, visibleZones]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!auth.user) return;
        const locId = auth.user.business_location_id || 1; // Fallback or dynamic based on active loc
        
        const channel = window.Echo.channel(`tables.${locId}`)
            .listen('.App\\Events\\TableStatusUpdated', () => {
                router.reload({ only: ['zones'] });
            });

        return () => {
            channel.stopListening('.App\\Events\\TableStatusUpdated');
            window.Echo.leaveChannel(`tables.${locId}`);
        };
    }, [auth.user]);

    const activeZoneData = visibleZones.find((z: any) => z.id === activeZone);

    const getTableColorClass = (table: any) => {
        if (!table.active_order) return 'bg-card border-border border-l-4 border-l-green-500 hover:border-l-green-600 text-card-foreground shadow-sm'; 
        if (table.active_order.status === 'billed') return 'bg-card border-border border-l-4 border-l-red-500 hover:border-l-red-600 text-card-foreground shadow-sm'; 
        return 'bg-card border-border border-l-4 border-l-orange-500 hover:border-l-orange-600 text-card-foreground shadow-sm'; 
    };

    const handleTableClick = (table: any) => {
        if (mergeMode) {
            if (selectedTablesToMerge.includes(table.id)) {
                setSelectedTablesToMerge(selectedTablesToMerge.filter(id => id !== table.id));
            } else {
                setSelectedTablesToMerge([...selectedTablesToMerge, table.id]);
            }
            return;
        }
        router.post('/menu-pos/terminal/open-table', { table_id: table.id });
    };

    const getRunningTime = (createdAt: string) => {
        const start = new Date(createdAt);
        const diffMs = currentTime.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    // Calculate Summary Stats
    let totalTables = 0;
    let available = 0;
    let occupied = 0;
    let billed = 0;

    visibleZones.forEach(zone => {
        zone.tables?.forEach((table: any) => {
            totalTables++;
            if (!table.active_order) available++;
            else if (table.active_order.status === 'billed') billed++;
            else occupied++;
        });
    });

    return (
        <>
            <Head title="Dine-In Tables" />
            <div className="flex flex-1 h-[calc(100vh-70px)] w-full bg-muted/10 overflow-hidden print:hidden flex-col">
                
                {/* Top Navigation Header */}
                <div className="bg-background border-b p-3 space-y-3 shadow-sm z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Segmented Mode Switcher (Dine-In / Takeaway) */}
                            <div className="inline-flex items-center p-0.5 bg-muted/60 border border-border/60 rounded-lg shadow-2xs">
                                <button
                                    type="button"
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all bg-background text-foreground shadow-xs cursor-default"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                                    <span>Dine-In</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get('/menu-pos/terminal')}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Takeaway</span>
                                </button>
                            </div>

                            {/* Live Orders button right along with the mode toggle */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2.5 border border-border/50 rounded-lg hover:bg-muted"
                                onClick={() => router.get('/menu-pos/live-orders')}
                            >
                                <ClipboardList className="w-3.5 h-3.5 text-primary" />
                                <span>Live Orders</span>
                            </Button>
                        </div>
                        
                        {/* Stats Summary */}
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-medium hidden sm:flex bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                    <span className="text-muted-foreground">Available: {available}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                    <span className="text-muted-foreground">Running: {occupied}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    <span className="text-muted-foreground">Billed: {billed}</span>
                                </div>
                                <div className="text-foreground font-bold">
                                    Total: {totalTables}
                                </div>
                            </div>
                            
                            {/* Manage Controls (Admin) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                                        <Settings className="w-4 h-4 mr-2" /> Manage Floor
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Floor Management</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditingZone(null); setZoneDialogOpen(true); }}>
                                        <Plus className="w-4 h-4 mr-2" /> Add New Zone
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        disabled={!activeZoneData}
                                        onSelect={(e) => { e.preventDefault(); setEditingZone(activeZoneData); setZoneDialogOpen(true); }}
                                    >
                                        <Pencil className="w-4 h-4 mr-2" /> Edit Current Zone
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        disabled={!activeZoneData}
                                        onSelect={(e) => { 
                                            e.preventDefault();
                                            setEditingTable(null); 
                                            setSelectedZoneForTable(activeZone || ''); 
                                            setTableDialogOpen(true); 
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Table (Current Zone)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Merge Controls */}
                            <div className="flex items-center gap-2">
                                {mergeMode ? (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => { setMergeMode(false); setSelectedTablesToMerge([]); }}
                                            className="h-8"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="default" 
                                            size="sm" 
                                            disabled={selectedTablesToMerge.length < 2}
                                            onClick={() => {
                                                router.post('/menu-pos/tables/merge', { table_ids: selectedTablesToMerge }, {
                                                    onSuccess: () => {
                                                        setMergeMode(false);
                                                        setSelectedTablesToMerge([]);
                                                    }
                                                });
                                            }}
                                            className="h-8 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                                        >
                                            Confirm Merge ({selectedTablesToMerge.length})
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setMergeMode(true)}
                                        className="h-8 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 font-medium"
                                    >
                                        Merge Tables
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Zone Toggles & Location Dropdown */}
                    <div className="flex items-center justify-between w-full mb-1">
                        {visibleZones.length > 0 ? (
                            <ScrollArea className="flex-1 whitespace-nowrap mr-4">
                                <div className="flex space-x-2 pb-1">
                                    {visibleZones.map((zone: any) => (
                                        <Button 
                                            key={zone.id}
                                            variant={activeZone === zone.id ? 'default' : 'outline'}
                                            className={cn(
                                                "rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-all cursor-pointer",
                                                activeZone === zone.id 
                                                    ? "bg-primary text-primary-foreground shadow-xs border-transparent hover:bg-primary/90" 
                                                    : "bg-muted/50 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                            onClick={() => setActiveZone(zone.id)}
                                        >
                                            {zone.name}
                                        </Button>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" className="hidden" />
                            </ScrollArea>
                        ) : (
                            <div className="flex-1"></div>
                        )}

                        {isAllOutlets && allLocations.length > 1 && (
                            <div className="shrink-0">
                                <Select 
                                    value={selectedLocationId ? selectedLocationId.toString() : ''} 
                                    onValueChange={(val) => setSelectedLocationId(val)}
                                >
                                    <SelectTrigger className="w-[180px] h-8 rounded-full text-xs bg-muted/50 border-border/50 focus:ring-0">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        {allLocations.map((loc: any) => (
                                            <SelectItem key={loc.id} value={loc.id.toString()} className="text-sm">
                                                {loc.location_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area - Table Grid */}
                <ScrollArea className="flex-1 min-h-0">
                    {visibleZones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                            <p className="text-lg font-medium text-foreground">No Dining Zones Found</p>
                            <p className="text-sm mt-1">Please set up your dining zones and tables in the admin panel.</p>
                        </div>
                    ) : activeZoneData ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-4 pb-8">
                            {activeZoneData.tables?.map((table: any) => {
                                const order = table.active_order;
                                const isAvailable = !order;
                                const isBilled = order?.status === 'billed';
                                const colorClass = getTableColorClass(table);
                                
                                // Lock logic: If an active order exists and current user is not the creator
                                const isLockedByOther = order && order.user_id !== currentUserId;
                                
                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => (!isLockedByOther || mergeMode) && handleTableClick(table)}
                                        className={cn(
                                            "relative flex flex-col p-2.5 border rounded-lg transition-all min-h-[96px] group overflow-hidden",
                                            table.is_merged ? cn(getMergeSpan(table.name), "bg-gradient-to-br from-card to-muted/30") : "",
                                            colorClass,
                                            isLockedByOther && !mergeMode ? "opacity-70 cursor-not-allowed hover:scale-[1.02]" : "cursor-pointer hover:shadow-md hover:scale-[1.02]",
                                            selectedTablesToMerge.includes(table.id) ? "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]" : ""
                                        )}
                                    >
                                        {isLockedByOther && !mergeMode && (
                                            <div className="absolute inset-0 bg-black/5 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                                <Users className="w-8 h-8 text-foreground/40 mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Occupied</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-1 relative z-0">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="text-base font-bold leading-none tracking-tight">{table.name}</div>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setEditingTable(table); 
                                                            setSelectedZoneForTable(activeZone || ''); 
                                                            setTableDialogOpen(true); 
                                                        }} 
                                                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted"
                                                        title="Edit Table"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                {table.is_merged && (
                                                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1 mt-0.5">
                                                        <span>🔗 Merged</span>
                                                        <span 
                                                            className="text-red-500 hover:text-red-600 cursor-pointer ml-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm("Are you sure you want to unmerge these tables?")) {
                                                                    router.post('/menu-pos/tables/unmerge', { parent_table_id: table.id });
                                                                }
                                                            }}
                                                        >
                                                            (Unmerge)
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border", 
                                                isAvailable ? "bg-muted/50 text-muted-foreground border-border/50" : "bg-primary/10 text-primary border-primary/20"
                                            )}>
                                                <Users size={10} /> 
                                                {order?.pax || table.seating_capacity}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-end mt-1">
                                            {order ? (
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        {order.waiter && (
                                                            <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                                                                <User size={10} className="text-muted-foreground" />
                                                                <span className="truncate max-w-[70px]">{order.waiter.name}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                                                            <Clock size={10} className="text-muted-foreground" />
                                                            <span>{getRunningTime(order.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] uppercase tracking-wider font-semibold mb-0.5 text-muted-foreground">Total</div>
                                                        <div className="font-bold text-sm leading-none tracking-tight text-foreground">
                                                            ₹{Number(order.grand_total).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                                    Available
                                                </div>
                                            )}
                                        </div>

                                        {isBilled && (
                                            <div className="absolute top-2 right-2 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-sm"></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </ScrollArea>
            </div>

            <ZoneFormDialog 
                open={zoneDialogOpen} 
                onOpenChange={setZoneDialogOpen} 
                zone={editingZone} 
            />
            
            <TableFormDialog 
                open={tableDialogOpen} 
                onOpenChange={setTableDialogOpen} 
                table={editingTable}
                zones={visibleZones}
                defaultZoneId={selectedZoneForTable}
            />

        </>
    );
}
