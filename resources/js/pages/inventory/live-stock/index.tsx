import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { XDataTable } from '@/components/x/table/XDataTable';
import { Entity } from '@/lib/permissions';
import { XPage } from '@/components/x/page/XPage';
import type { PageProps } from '@/types';
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { PackageOpen, AlertCircle, ShoppingCart, FileText, Lock, LayoutList } from "lucide-react";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";

import { StorageTransferDialog } from './StorageTransferDialog';
import { ArrowRightLeft } from 'lucide-react';

export default function InventoryBalancesIndex({
  inventoryBalances,
  allInventoryBalances = [],
  serverCategories,
  totalItemsCount,
  storageLocations = [],
  ingredients = [],
}: PageProps<{
  inventoryBalances: {
    rows: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
    filters?: any[];
  };
  allInventoryBalances?: any[];
  serverCategories?: Record<string, number>;
  totalItemsCount?: number;
  storageLocations?: any[];
  ingredients?: any[];
}>) {
  const [activeTab, setActiveTab] = useState("all");
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedRowForTransfer, setSelectedRowForTransfer] = useState<any>(null);

  // Derive selected category from server filters
  const selectedCategory = useMemo(() => {
    const filters = inventoryBalances.filters || [];
    const catFilter = filters.find((f: any) => f.id === 'ingredient.category.name');
    return catFilter ? catFilter.value : null;
  }, [inventoryBalances.filters]);

  const handleCategoryClick = (category: string | null) => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    
    let filters = [];
    try {
        const filtersJson = searchParams.get('filters');
        if (filtersJson) filters = JSON.parse(filtersJson);
    } catch (e) {}

    filters = filters.filter((f: any) => f.id !== 'ingredient.category.name');
    if (category) {
        filters.push({ id: 'ingredient.category.name', value: category });
    }

    if (filters.length > 0) {
        searchParams.set('filters', JSON.stringify(filters));
    } else {
        searchParams.delete('filters');
    }

    searchParams.set('page', '1');

    router.get('/inventory/live-stock', { filters: searchParams.get('filters') }, { preserveState: true, preserveScroll: true });
  };

  // Auto-refresh the live stock data every 15 seconds
  useEffect(() => {
    const dataInterval = setInterval(() => {
        router.reload({ only: ['inventoryBalances', 'serverCategories', 'totalItemsCount'], preserveScroll: true, preserveState: true });
    }, 15000);
    return () => clearInterval(dataInterval);
  }, []);

  // Compute overall stats
  const stats = useMemo(() => {
    const rows = inventoryBalances.rows || [];
    let inStock = 0;
    let outOfStock = 0;
    let reserved = 0;
    let onOrder = 0;

    rows.forEach(item => {
      const available = Number(item.available_qty) || 0;
      if (available > 0) inStock++;
      else outOfStock++;
      if (Number(item.reserved_qty) > 0) reserved++;
      if (Number(item.on_order_qty) > 0) onOrder++;
    });

    return { total: totalItemsCount ?? inventoryBalances.total ?? rows.length, inStock, outOfStock, reserved, onOrder };
  }, [inventoryBalances, totalItemsCount]);

  // Extract categories BEFORE filtering by tab, so the sidebar always shows all categories
  const categories = useMemo(() => {
    if (serverCategories) {
        return Object.entries(serverCategories).sort((a, b) => a[0].localeCompare(b[0]));
    }
    const rows = inventoryBalances.rows || [];
    const catMap: Record<string, number> = {};
    rows.forEach(row => {
      const cat = row.ingredient?.category?.name || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    return Object.entries(catMap).sort((a, b) => a[0].localeCompare(b[0]));
  }, [inventoryBalances, serverCategories]);

  // Filter the data by tab
  const processedData = useMemo(() => {
    let filteredRows = inventoryBalances.rows || [];
    if (activeTab === "in_stock") {
      filteredRows = filteredRows.filter((item: any) => Number(item.available_qty) > 0);
    } else if (activeTab === "out_of_stock") {
      filteredRows = filteredRows.filter((item: any) => Number(item.available_qty) <= 0);
    } else if (activeTab === "on_order") {
      filteredRows = filteredRows.filter((item: any) => Number(item.on_order_qty) > 0);
    }

    return { ...inventoryBalances, rows: filteredRows };
  }, [inventoryBalances, activeTab]);

  return (
    <XPage 
      title="Live Stock" 
      fullWidth={true} 
      breadcrumbs={[{ label: 'Live Stock', href: '/inventory/live-stock' }]}
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Stock Inventory</h1>
          <p className="text-sm text-muted-foreground">Monitor real-time inventory balances and perform inter-storage transfers.</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedRowForTransfer(null);
            setTransferDialogOpen(true);
          }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md gap-2 shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" /> Transfer Stock
        </Button>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-6">
        <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Items</p>
                    <h3 className="text-2xl font-bold leading-none">{stats.total}</h3>
                </div>
                <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
                    <PackageOpen className="size-5" />
                </div>
            </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">In Stock</p>
                    <h3 className="text-2xl font-bold leading-none">{stats.inStock}</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                    <ShoppingCart className="size-5" />
                </div>
            </CardContent>
        </Card>

        <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
            <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Out of Stock</p>
                    <h3 className="text-2xl font-bold leading-none">{stats.outOfStock}</h3>
                </div>
                <div className="p-2 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                    <AlertCircle className="size-5" />
                </div>
            </CardContent>
        </Card>

        <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reserved</p>
                    <h3 className="text-2xl font-bold leading-none">{stats.reserved}</h3>
                </div>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                    <Lock className="size-5" />
                </div>
            </CardContent>
        </Card>

        <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">On Order</p>
                    <h3 className="text-2xl font-bold leading-none">{stats.onOrder}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
                    <FileText className="size-5" />
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Quick Filter Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full sm:w-[600px] grid-cols-4 h-11 bg-muted/50 p-1">
            <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Stock</TabsTrigger>
            <TabsTrigger value="in_stock" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">In Stock</TabsTrigger>
            <TabsTrigger value="out_of_stock" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Out of Stock</TabsTrigger>
            <TabsTrigger value="on_order" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">On Order</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative min-h-[calc(100vh-140px)] flex flex-col">
        
        {/* Floating Right Nav Anchor (Fixed Position) */}
        <div className="absolute right-0 top-0 z-20 flex flex-col items-end">
          <button
             onClick={() => setShowCategorySidebar(!showCategorySidebar)}
             className={`group flex items-center justify-center p-2 bg-card border shadow-sm hover:bg-muted/80 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden h-9 whitespace-nowrap ${showCategorySidebar ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
             title="Toggle Categories"
          >
             <LayoutList className={`size-4 shrink-0 transition-colors duration-500 ${showCategorySidebar ? 'text-primary' : 'group-hover:text-primary'}`} />
             <div className="overflow-hidden w-0 opacity-0 group-hover:w-[84px] group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
               <span className="font-semibold text-sm pl-2">
                 Categories
               </span>
             </div>
          </button>

          {/* Floating Sidebar Content */}
          <div className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] mt-3 overflow-hidden rounded-xl bg-sidebar text-sidebar-foreground flex flex-col ${
            showCategorySidebar ? 'w-full md:w-56 opacity-100 h-fit max-h-[calc(100vh-140px)] border border-sidebar-border shadow-sm' : 'w-0 opacity-0 h-0 border-transparent shadow-none'
          }`}>
             <div className="w-full md:w-56 flex flex-col h-fit shrink-0">
                <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    <LayoutList className="size-4" />
                    Categories
                  </h3>
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-300">
                    {categories.length}
                  </Badge>
                </div>
                
                <div className="p-3 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      selectedCategory === null 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md transition-all duration-300 ${selectedCategory === null ? 'bg-background' : 'bg-sidebar-accent/50 group-hover:bg-background'}`}>
                      {totalItemsCount ?? inventoryBalances.total ?? 0}
                    </span>
                  </button>
                  
                  {categories.map(([cat, count]) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`group w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        selectedCategory === cat 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${selectedCategory === cat ? 'bg-background' : 'bg-sidebar-accent/50 group-hover:bg-background'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Left Main Content: Data Table */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${showCategorySidebar ? 'md:mr-[240px]' : ''}`}>
          <XDataTable
            columns={[
              {
                id: 'ingredient.name',
                header: 'Ingredient',
                accessorKey: 'ingredient.name',
                enableColumnFilter: true,
                meta: { label: 'Ingredient', variant: 'text' },
              },
              {
                id: 'ingredient.category.name',
                header: 'Category',
                accessorKey: 'ingredient.category.name',
                enableColumnFilter: true,
                meta: { label: 'Category', variant: 'text' },
              },
              {
                id: 'storage_location.storage_name',
                header: 'Storage Location',
                accessorKey: 'storage_location.storage_name',
                enableColumnFilter: true,
                meta: { label: 'Storage Location', variant: 'text' },
              },
              {
                id: 'branch',
                header: 'Branch',
                accessorKey: 'storage_location.business_location.location_name',
              },
              {
                id: 'available',
                header: 'Available',
                accessorKey: 'available_qty',
                cell: ({ row }) => (
                  <span className={`font-semibold ${Number(row.original.available_qty) <= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {row.original.available_qty} <span className="text-xs opacity-70 font-normal">{row.original.ingredient?.base_uom?.code || ''}</span>
                  </span>
                ),
              },
              {
                id: 'reserved',
                header: 'Reserved',
                accessorKey: 'reserved_qty',
                cell: ({ row }) => (
                  <span className="text-amber-600 font-medium">
                    {row.original.reserved_qty} <span className="text-xs opacity-70 font-normal">{row.original.ingredient?.base_uom?.code || ''}</span>
                  </span>
                ),
              },
              {
                id: 'on_order',
                header: 'On Order',
                accessorKey: 'on_order_qty',
                cell: ({ row }) => (
                  <span className="text-blue-600 font-medium">
                    {row.original.on_order_qty} <span className="text-xs opacity-70 font-normal">{row.original.ingredient?.base_uom?.code || ''}</span>
                  </span>
                ),
              },
              {
                id: 'actions',
                header: 'Transfer',
                cell: ({ row }) => (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                    onClick={() => {
                      setSelectedRowForTransfer(row.original);
                      setTransferDialogOpen(true);
                    }}
                  >
                    <ArrowRightLeft className="w-3 h-3" /> Transfer
                  </Button>
                ),
              },
            ]}
            data={processedData}
            entity={Entity.InventoryBalances}
            title={selectedCategory ? `${selectedCategory} Stock` : "Live Stock"}
          />
        </div>
      </div>

      <StorageTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        storageLocations={storageLocations}
        inventoryBalances={inventoryBalances.rows || []}
        allInventoryBalances={allInventoryBalances}
        allIngredients={ingredients}
        preselectedBalance={selectedRowForTransfer}
      />
    </XPage>
  );
}
