import React from 'react';
import { Head } from '@inertiajs/react';
import { XDataTable } from '@/components/x/table/XDataTable';
import { Entity } from '@/lib/permissions';
import { index, create, edit, destroy } from '@/generated/routes/approval-configurations';
import type { PageProps } from '@/types';

export default function ApprovalConfigurationsIndex({
  approvalConfigurations,
}: PageProps<{
  approvalConfigurations: {
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
      <Head title="Approval Configurations" />
      <div className="space-y-6">
        <XDataTable
          titleButtons={[
            {
              label: "Add Configuration",
              link: create.url(),
              type: "create",
            },
          ]}
          columns={[
            {
              header: 'Org Size Tier',
              accessorKey: 'org_size_tier',
              sortable: true,
            },
            {
              header: 'Required Approvers',
              accessorKey: 'num_approvers_required',
            },
            {
              header: 'Sequence Rule',
              accessorKey: 'approver_sequence_rule',
            },
            {
              header: 'Status',
              accessorKey: 'status',
              type: 'boolean',
              sortable: true,
            },
          ]}
          data={approvalConfigurations}
          actions={[
            { 
              action: "edit",
              url: (row) => edit.url(row.uuid)
            },
            { 
              action: "delete",
              url: (row) => destroy.url(row.uuid)
            },
          ]}
          entity={Entity.ApprovalConfigurations}
          title="Approval Configurations"
        />
      </div>
    </>
  );
}
