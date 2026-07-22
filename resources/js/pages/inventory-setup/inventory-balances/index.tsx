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
          columns={[
            {
              header: 'Ingredient',
              accessorKey: 'ingredient.name',
              sortable: true,
            },
            {
              header: 'Storage Location',
              accessorKey: 'storage_location.name',
              sortable: true,
            },
            {
              header: 'Branch',
              accessorKey: 'storage_location.business_location.name',
            },
            {
              header: 'Available',
              accessorKey: 'available_qty',
              cell: (row) => `${row.available_qty} ${row.ingredient?.base_uom?.code || ''}`,
            },
            {
              header: 'Reserved',
              accessorKey: 'reserved_qty',
              cell: (row) => `${row.reserved_qty} ${row.ingredient?.base_uom?.code || ''}`,
            },
            {
              header: 'On Order',
              accessorKey: 'on_order_qty',
              cell: (row) => `${row.on_order_qty} ${row.ingredient?.base_uom?.code || ''}`,
            },
          ]}
          data={inventoryBalances}
          entity={Entity.InventoryBalances}
          title="Inventory Balances"
        />
      </div>
    </>
  );
}
