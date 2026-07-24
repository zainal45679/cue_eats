import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { XDataTable } from '@/components/x/table/XDataTable';
import { Entity } from '@/lib/permissions';
import { XPage } from '@/components/x/page/XPage';
import type { PageProps } from '@/types';
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { PackageOpen, AlertCircle, ShoppingCart } from "lucide-react";

export default function InventoryBalancesIndex({
  inventoryBalances,
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
}>) {
  const [activeTab, setActiveTab] = useState("all");

  const stats = useMemo(() => {
    const rows = inventoryBalances.rows || [];
    return {
      inStock: rows.filter((item: any) => Number(item.available_qty) > 0).length,
      outOfStock: rows.filter((item: any) => Number(item.available_qty) <= 0).length,
      onOrder: rows.filter((item: any) => Number(item.on_order_qty) > 0).length,
    };
  }, [inventoryBalances]);

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
    <XPage title="Live Stock">
      <Head title="Live Stock" />
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-800 mb-1">In Stock</p>
              <h3 className="text-2xl font-bold text-emerald-900">{stats.inStock}</h3>
            </div>
            <div className="p-3 bg-emerald-100/50 rounded-full text-emerald-600">
              <PackageOpen className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-800 mb-1">Out of Stock</p>
              <h3 className="text-2xl font-bold text-red-900">{stats.outOfStock}</h3>
            </div>
            <div className="p-3 bg-red-100/50 rounded-full text-red-600">
              <AlertCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-800 mb-1">On Order</p>
              <h3 className="text-2xl font-bold text-blue-900">{stats.onOrder}</h3>
            </div>
            <div className="p-3 bg-blue-100/50 rounded-full text-blue-600">
              <ShoppingCart className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filter Tabs */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-[600px] grid-cols-4 h-11 bg-muted/50 p-1">
            <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Stock</TabsTrigger>
            <TabsTrigger value="in_stock" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">In Stock</TabsTrigger>
            <TabsTrigger value="out_of_stock" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Out of Stock</TabsTrigger>
            <TabsTrigger value="on_order" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">On Order</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
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
                  {row.original.available_qty} {row.original.ingredient?.base_uom?.code || ''}
                </span>
              ),
            },
            {
              id: 'reserved',
              header: 'Reserved',
              accessorKey: 'reserved_qty',
              cell: ({ row }) => `${row.original.reserved_qty} ${row.original.ingredient?.base_uom?.code || ''}`,
            },
            {
              id: 'on_order',
              header: 'On Order',
              accessorKey: 'on_order_qty',
              cell: ({ row }) => `${row.original.on_order_qty} ${row.original.ingredient?.base_uom?.code || ''}`,
            },
          ]}
          data={processedData}
          entity={Entity.InventoryBalances}
          title="Live Stock"
        />
      </div>
    </XPage>
  );
}
