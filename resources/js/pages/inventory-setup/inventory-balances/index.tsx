import React from 'react';
import { Head } from '@inertiajs/react';
import { XDataTable } from '@/components/x/table/XDataTable';
import { Entity } from '@/lib/permissions';
import { index } from '@/generated/routes/inventory-balances';
import type { PageProps } from '@/types';

export default function InventoryBalancesIndex({
  inventoryBalances,
}: PageProps<{
  inventoryBalances: {
    data: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
  };
}>) {
  return (
    <>
      <Head title="Inventory Balances" />
      <div className="space-y-6">
        <XDataTable
          titleButtons={[
            {
              label: "Add Balance",
              link: "/inventory-setup/inventory-balances/create",
              type: "create",
            },
          ]}
          columns={[
            {
              header: 'Ingredient',
              accessorKey: 'ingredient.name',
              sortable: true,
            },
            {
              header: 'Storage Location',
              accessorKey: 'storage_location.storage_name',
              sortable: true,
            },
            {
              header: 'Branch',
              accessorKey: 'storage_location.business_location.location_name',
            },
            {
              header: 'Available',
              accessorKey: 'available_qty',
              cell: ({ row }) => `${row.original.available_qty} ${row.original.ingredient?.base_uom?.code || ''}`,
            },
            {
              header: 'Reserved',
              accessorKey: 'reserved_qty',
              cell: ({ row }) => `${row.original.reserved_qty} ${row.original.ingredient?.base_uom?.code || ''}`,
            },
            {
              header: 'On Order',
              accessorKey: 'on_order_qty',
              cell: ({ row }) => `${row.original.on_order_qty} ${row.original.ingredient?.base_uom?.code || ''}`,
            },
          ]}
          data={inventoryBalances}
          actions={[
            { 
              action: "edit",
              url: (row) => `/inventory-setup/inventory-balances/${row.uuid}/edit`
            },
            { 
              action: "delete",
              url: (row) => `/inventory-setup/inventory-balances/${row.uuid}`
            },
          ]}
          entity={Entity.InventoryBalances}
          title="Inventory Balances"
        />
      </div>
    </>
  );
}
