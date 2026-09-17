import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import { ZoneFormDialog } from './ZoneFormDialog';
import { TableFormDialog } from './TableFormDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/shadcn/ui/dropdown-menu';
import { 
    Settings, 
    Plus, 
    Pencil, 
    Trash2, 
    Edit, 
    ArrowRight, 
    Users, 
    ReceiptText, 
    Clock, 
    User, 
    ArrowLeft, 
    Lock, 
    LayoutGrid, 
    ShoppingBag, 
    ClipboardList,
    Printer,
    Eye,
    Save,
    Unlink,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { 
    AlertDialog, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogAction, 
    AlertDialogCancel 
} from '@/components/shadcn/ui/alert-dialog';
import { toast } from 'sonner';
import { PrintReceipt } from '../terminal/components/PrintReceipt';

export default function TablesScreen({ zones = [] }: { zones?: any[] }) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const currentUserLocationId = auth?.user?.business_location_id;
    const isAllOutlets = auth?.active_location_id === null;
    const allLocations = auth?.all_business_locations || [];
    const [selectedLocationId, setSelectedLocationId] = useState(
        isAllOutlets ? (allLocations[0]?.id || null) : auth?.active_location_id
    );
    
    const visibleZones = React.useMemo(() => {
        return zones.filter((z: any) => z.business_location_id === selectedLocationId);
    }, [zones, selectedLocationId]);
    
    // 'all' to show all sections vertically like Petpooja, or specific zone id
    const [activeZone, setActiveZone] = useState<string | 'all'>('all');
    const [currentTime, setCurrentTime] = useState(new Date());

    const [mergeMode, setMergeMode] = useState(false);
    const [selectedTablesToMerge, setSelectedTablesToMerge] = useState<string[]>([]);

    const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [selectedZoneForTable, setSelectedZoneForTable] = useState<string>('');

    // Quick View Order Modal
    const [viewOrder, setViewOrder] = useState<any | null>(null);

    // Direct Receipt Printing Trigger
    const [orderToPrint, setOrderToPrint] = useState<any | null>(null);

    // Unmerge confirmation dialog state
    const [tableToUnmerge, setTableToUnmerge] = useState<any>(null);
    const [isUnmerging, setIsUnmerging] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!currentUserId) return;
        const locId = selectedLocationId || currentUserLocationId;
        if (!locId) return;
        
        let channel: any = null;
        if (window.Echo) {
            channel = window.Echo.private(`tables.${locId}`)
                .listen('.App\\Events\\TableStatusUpdated', () => {
                    router.reload({ only: ['zones'], preserveScroll: true, preserveState: true });
                })
                .listen('.App\\Events\\OrderStatusUpdated', () => {
                    router.reload({ only: ['zones'], preserveScroll: true, preserveState: true });
                });
        }

        // Silent 15-second background polling fallback
        const pollInterval = setInterval(() => {
            router.reload({ only: ['zones'], preserveScroll: true, preserveState: true });
        }, 15000);

        return () => {
            clearInterval(pollInterval);
            if (channel && window.Echo) {
                channel.stopListening('.App\\Events\\TableStatusUpdated');
                channel.stopListening('.App\\Events\\OrderStatusUpdated');
                window.Echo.leave(`tables.${locId}`);
            }
        };
    }, [currentUserId, currentUserLocationId, selectedLocationId]);

    const activeZoneData = React.useMemo(() => {
        return activeZone === 'all' 
            ? null 
            : visibleZones.find((z: any) => z.id === activeZone);
    }, [activeZone, visibleZones]);

    const handleUnmergeTable = (table: any) => {
        setTableToUnmerge(table);
    };

    const confirmUnmergeTable = () => {
        if (!tableToUnmerge || isUnmerging) return;
        setIsUnmerging(true);
        const targetTable = tableToUnmerge;
        router.post('/menu-pos/tables/unmerge', { parent_table_id: targetTable.id }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUnmerging(false);
                setTableToUnmerge(null);
                toast.success(`Table ${targetTable.name} unmerged successfully.`);
            },
            onError: (errors: any) => {
                setIsUnmerging(false);
                setTableToUnmerge(null);
                toast.error(errors.error || Object.values(errors)[0] || 'Failed to unmerge tables.');
            }
        });
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

    // Petpooja Summary Stats
    let totalTables = 0;
    let available = 0;
    let seated = 0;
    let running = 0;
    let billed = 0;

    visibleZones.forEach(zone => {
        zone.tables?.forEach((table: any) => {
            totalTables++;
            if (!table.active_order) {
                available++;
            } else if (table.active_order.status === 'draft') {
                seated++;
            } else if (table.active_order.status === 'billed') {
                billed++;
            } else {
                running++;
            }
        });
    });

    const renderTableCard = (table: any, zone: any) => {
        const order = table.active_order;
        const isAvailable = !order;
        const isDraft = order?.status === 'draft';
        const isBilled = order?.status === 'billed';
        const isRunning = order && !isDraft && !isBilled;

        const isLockedByOther = order && order.user_id && order.user_id !== currentUserId;

        return (
            <div
                key={table.id}
                onClick={() => (!isLockedByOther || mergeMode) && handleTableClick(table)}
                className={cn(
                    "relative rounded-xl flex flex-col items-center justify-center select-none transition-all duration-150 group h-[78px] sm:h-[84px] cursor-pointer",
                    table.is_merged ? "col-span-2 min-w-[176px]" : "col-span-1",
                    // Status palette - distinct from Petpooja
                    isAvailable && "border-2 border-dashed border-slate-300 dark:border-slate-700 bg-card/60 dark:bg-muted/20 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:bg-card/90",
                    isDraft && "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border border-emerald-300/80 dark:border-emerald-700/80 shadow-2xs hover:brightness-95",
                    isRunning && "bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-100 border border-orange-300/80 dark:border-orange-700/80 shadow-2xs hover:brightness-95",
                    isBilled && "bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 border border-purple-300/80 dark:border-purple-700/80 shadow-2xs hover:brightness-95",
                    // Merge selection state
                    selectedTablesToMerge.includes(table.id) && "ring-2 ring-indigo-500 ring-offset-2 scale-[1.03] border-indigo-400 dark:border-indigo-500 shadow-md",
                    isLockedByOther && !mergeMode && "opacity-80"
                )}
            >
                {/* Seating capacity badge on merged table */}
                {table.is_merged && !mergeMode && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-background/70 px-1.5 py-0.5 rounded-md border border-border/50 shadow-2xs">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span>{table.seating_capacity}</span>
                    </div>
                )}

                {/* Merge mode selection number badge */}
                {mergeMode && (
                    <div className="absolute top-1 right-1 z-10 pointer-events-none">
                        <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all",
                            selectedTablesToMerge.includes(table.id)
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-background/90 text-muted-foreground border-border/80"
                        )}>
                            {selectedTablesToMerge.includes(table.id) 
                                ? selectedTablesToMerge.indexOf(table.id) + 1 
                                : ""}
                        </div>
                    </div>
                )}

                {/* Subtle Edit button on hover (disabled during merge mode) */}
                {!mergeMode && !table.is_merged && (
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingTable(table); 
                            setSelectedZoneForTable(zone.id || ''); 
                            setTableDialogOpen(true); 
                        }} 
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 dark:text-slate-300 hover:text-foreground p-1 rounded hover:bg-black/10 z-10 cursor-pointer"
                        title="Edit Table"
                    >
                        <Edit className="w-3 h-3" />
                    </button>
                )}

                {/* Table Name */}
                <span className={cn(
                    "font-semibold tracking-tight text-center truncate px-2 text-slate-800 dark:text-slate-100",
                    table.is_merged ? "text-sm font-bold px-4" : "text-xs sm:text-[13px]"
                )}>
                    {table.name}
                </span>

                {/* Unmerge Table Action on Merged Table */}
                {table.is_merged && !mergeMode ? (
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            handleUnmergeTable(table); 
                        }} 
                        className="mt-1 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-950 dark:text-amber-200 border border-amber-500/40 transition-all shadow-2xs z-10 cursor-pointer active:scale-95"
                        title="Click to unmerge this table group"
                    >
                        <Unlink className="w-2.5 h-2.5 text-amber-700 dark:text-amber-300" />
                        <span>Unmerge Table</span>
                        {order && (
                            <span className="text-primary font-bold ml-0.5">
                                • ₹{Number(order.grand_total || order.total || 0).toFixed(0)}
                            </span>
                        )}
                    </button>
                ) : table.is_merged && mergeMode ? (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        Unmerge Table
                    </span>
                ) : null}

                {/* Lock indicator */}
                {isLockedByOther && !mergeMode && !table.is_merged && (
                    <div className="absolute top-1 left-1.5 flex items-center gap-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                        <Lock size={10} />
                    </div>
                )}

                {/* Petpooja Floating Action Pills at Bottom Edge (hidden during merge mode to keep card clicks clean) */}
                {!mergeMode && isDraft && (
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTableClick(table);
                        }}
                        title="Open Draft Order"
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs rounded-md px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                    </div>
                )}

                {!mergeMode && isRunning && (
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            setOrderToPrint(order);
                        }}
                        title="Print Bill"
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs rounded-md px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                    </div>
                )}

                {!mergeMode && isBilled && (
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOrderToPrint(order);
                            }}
                            title="Reprint Bill"
                            className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs rounded-md px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewOrder(order);
                            }}
                            title="View Bill Details"
                            className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs rounded-md px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const zonesToRender = React.useMemo(() => {
        return activeZone === 'all' 
            ? visibleZones 
            : visibleZones.filter((z: any) => z.id === activeZone);
    }, [activeZone, visibleZones]);

    return (
        <>
            <Head title="Dine-In Tables" />
            <div className="flex flex-1 h-[calc(100vh-70px)] w-full bg-muted/10 overflow-hidden print:hidden flex-col">
                
                {/* Top Navigation Header */}
                <div className="bg-background border-b p-3 space-y-3 shadow-2xs z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Segmented Mode Switcher (Dine-In / Takeaway / Live Orders) */}
                            <div className="inline-flex items-center p-0.5 bg-muted/60 border border-border/60 rounded-lg shadow-2xs">
                                <button
                                    type="button"
                                    className="relative flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors text-foreground cursor-default select-none"
                                >
                                    <motion.span
                                        layoutId="pos-top-mode-pill"
                                        className="absolute inset-0 rounded-md bg-background shadow-xs"
                                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                    />
                                    <LayoutGrid className="w-3.5 h-3.5 text-primary relative z-10" />
                                    <span className="relative z-10">Dine-In</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get('/menu-pos/terminal')}
                                    className="relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer select-none"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Takeaway</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get('/menu-pos/live-orders')}
                                    className="relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer select-none"
                                >
                                    <ClipboardList className="w-3.5 h-3.5" />
                                    <span>Live Orders</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Status Legend & Counts - Distinct Colors */}
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-medium hidden md:flex bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 items-center gap-3.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-400 bg-card/60"></span>
                                    <span className="text-muted-foreground">Blank: <strong className="text-foreground font-semibold">{available}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-400/80 dark:border-emerald-600"></span>
                                    <span className="text-muted-foreground">Seated: <strong className="text-foreground font-semibold">{seated}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded bg-orange-100 dark:bg-orange-900/60 border border-orange-400/80 dark:border-orange-600"></span>
                                    <span className="text-muted-foreground">Running: <strong className="text-foreground font-semibold">{running}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded bg-purple-100 dark:bg-purple-900/60 border border-purple-400/80 dark:border-purple-600"></span>
                                    <span className="text-muted-foreground">Billed: <strong className="text-foreground font-semibold">{billed}</strong></span>
                                </div>
                                <div className="text-foreground font-bold pl-2 border-l border-border/60">
                                    Total: {totalTables}
                                </div>
                            </div>
                            
                            {/* Manage Controls (Admin) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 border-dashed cursor-pointer">
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
                                        disabled={visibleZones.length === 0}
                                        onSelect={(e) => { 
                                            e.preventDefault();
                                            setEditingTable(null); 
                                            setSelectedZoneForTable(activeZone === 'all' ? (visibleZones[0]?.id || '') : activeZone); 
                                            setTableDialogOpen(true); 
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Table
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Merge Controls */}
                            <div className="flex items-center gap-2">
                                {mergeMode ? (
                                    <>
                                        <span className="text-xs text-muted-foreground hidden lg:inline-block font-medium">
                                            Select 2 or more tables to combine
                                        </span>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => { setMergeMode(false); setSelectedTablesToMerge([]); }}
                                            className="h-8 cursor-pointer"
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
                                                        toast.success('Tables merged successfully.');
                                                    },
                                                    onError: (errors: any) => {
                                                        toast.error(errors.error || Object.values(errors)[0] || 'Failed to merge tables.');
                                                    }
                                                });
                                            }}
                                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                                        >
                                            Confirm Merge ({selectedTablesToMerge.length})
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setMergeMode(true)}
                                        className="h-8 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 font-medium cursor-pointer"
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
                            <div className="flex-1 overflow-x-auto no-scrollbar mr-4">
                                <div className="flex space-x-2 pb-1 items-center">
                                    {/* All Sections Pill */}
                                    <motion.button 
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "relative rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center select-none border outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                                            activeZone === 'all'
                                                ? "border-transparent text-primary-foreground font-semibold" 
                                                : "border-border/70 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                        onClick={() => setActiveZone('all')}
                                    >
                                        {activeZone === 'all' && (
                                            <motion.span
                                                layoutId="tables-active-zone-pill"
                                                className="absolute inset-0 rounded-full bg-primary shadow-xs"
                                                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                            />
                                        )}
                                        <span className="relative z-10">All Sections ({totalTables})</span>
                                    </motion.button>

                                    {/* Individual Zone Pills */}
                                    {visibleZones.map((zone: any) => {
                                        const isActive = activeZone === zone.id;
                                        return (
                                            <motion.button 
                                                key={zone.id}
                                                type="button"
                                                whileTap={{ scale: 0.95 }}
                                                className={cn(
                                                    "relative rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center select-none border outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                                                    isActive 
                                                        ? "border-transparent text-primary-foreground font-semibold" 
                                                        : "border-border/70 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                )}
                                                onClick={() => setActiveZone(zone.id)}
                                            >
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="tables-active-zone-pill"
                                                        className="absolute inset-0 rounded-full bg-primary shadow-xs"
                                                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{zone.name} ({zone.tables?.length || 0})</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1"></div>
                        )}

                        {isAllOutlets && allLocations.length > 1 && (
                            <div className="shrink-0">
                                <Select 
                                    value={selectedLocationId ? selectedLocationId.toString() : (allLocations[0]?.id ? allLocations[0].id.toString() : undefined)} 
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

                {/* Main Content Area - Petpooja Style Table Floor Plan */}
                <ScrollArea className="flex-1 min-h-0 bg-background/50">
                    <div className="p-5 pb-12 max-w-[1600px] mx-auto space-y-8">
                        {visibleZones.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                                <p className="text-lg font-medium text-foreground">No Dining Zones Found</p>
                                <p className="text-sm mt-1">Please set up your dining zones and tables in Manage Floor.</p>
                            </div>
                        ) : (
                            zonesToRender.map((zone: any) => (
                                <div key={zone.id} className="space-y-3.5">
                                    {/* Section Heading like A/C, Non A/C in Petpooja */}
                                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                                        <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                                            <span>{zone.name}</span>
                                            <span className="text-xs font-normal text-muted-foreground">({zone.tables?.length || 0} tables)</span>
                                        </h3>
                                    </div>

                                    {/* Petpooja Grid of Tables */}
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-x-3.5 gap-y-7 items-start">
                                        {zone.tables && zone.tables.length > 0 ? (
                                            zone.tables.map((table: any) => renderTableCard(table, zone))
                                        ) : (
                                            <div className="col-span-full py-6 text-xs text-muted-foreground italic">
                                                No tables added to this section yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* View Order Dialog (Petpooja Eye Icon) */}
            {viewOrder && (
                <Dialog open={true} onOpenChange={(open) => !open && setViewOrder(null)}>
                    <DialogContent className="sm:max-w-[440px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-4 border-b bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                                        <span>{viewOrder?.dining_table?.name || viewOrder?.diningTable?.name || 'Table Order'}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                            {viewOrder?.status}
                                        </span>
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Order #{viewOrder?.order_number} {viewOrder?.waiter?.name && `• Waiter: ${viewOrder.waiter.name}`}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 max-h-[360px] overflow-y-auto p-4">
                            <div className="space-y-3">
                                <div className="divide-y divide-border/60">
                                    {viewOrder?.items?.map((item: any) => (
                                        <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-foreground">
                                                    {item.menu_item?.name || item.item_name || 'Item'}
                                                </p>
                                                <p className="text-muted-foreground text-[11px]">
                                                    {item.quantity} × ₹{Number(item.unit_price || 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-foreground">
                                                ₹{Number(item.total_price || (item.quantity * item.unit_price) || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-3 border-t border-border/70 space-y-1.5 text-xs">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>₹{Number(viewOrder?.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    {Number(viewOrder?.tax_amount || 0) > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Tax</span>
                                            <span>₹{Number(viewOrder?.tax_amount || 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/60">
                                        <span>Grand Total</span>
                                        <span className="text-primary font-mono">₹{Number(viewOrder?.grand_total || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-3 border-t bg-muted/20 flex items-center justify-between gap-2 sm:justify-between">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1.5 text-xs h-8 cursor-pointer"
                                onClick={() => {
                                    setOrderToPrint(viewOrder);
                                }}
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Bill
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs h-8 cursor-pointer"
                                    onClick={() => setViewOrder(null)}
                                >
                                    Close
                                </Button>
                                <Button 
                                    size="sm" 
                                    className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 cursor-pointer shadow-2xs"
                                    onClick={() => {
                                        router.get('/menu-pos/terminal', { order_id: viewOrder.id });
                                    }}
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Open in POS
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Direct Receipt Print Trigger */}
            {orderToPrint && (
                <PrintReceipt 
                    order={orderToPrint} 
                    isBillOnly={true} 
                    onPrinted={() => setOrderToPrint(null)} 
                />
            )}

            {/* Unmerge Confirmation Dialog */}
            <AlertDialog open={!!tableToUnmerge} onOpenChange={(open) => !open && setTableToUnmerge(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            Unmerge Table
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unmerge <strong>{tableToUnmerge?.name}</strong>? The tables will be split back into individual tables.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUnmerging}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isUnmerging}
                            className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                            onClick={confirmUnmergeTable}
                        >
                            {isUnmerging ? 'Unmerging...' : 'Unmerge Table'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {zoneDialogOpen && (
                <ZoneFormDialog 
                    open={zoneDialogOpen} 
                    onOpenChange={setZoneDialogOpen} 
                    zone={editingZone} 
                />
            )}
            
            {tableDialogOpen && (
                <TableFormDialog 
                    open={tableDialogOpen} 
                    onOpenChange={setTableDialogOpen} 
                    table={editingTable}
                    zones={visibleZones}
                    defaultZoneId={selectedZoneForTable}
                />
            )}
        </>
    );
}
