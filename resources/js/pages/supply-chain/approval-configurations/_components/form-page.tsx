import React from 'react';
import { Head } from '@inertiajs/react';
import { store, update } from '@/generated/routes/approval-configurations';
import { z } from 'zod';
import { XLaravelForm } from '@/components/x/form/XLaravelForm';
import { XFormInput } from '@/components/x/form/components/XFormInput';
import { XFormSelect } from '@/components/x/form/components/XFormSelect';
import { XFormSwitch } from '@/components/x/form/components/XFormSwitch';
import type { PageProps } from '@/types';

const schema = z.object({
  org_size_tier: z.string().min(1, 'Org Size Tier is required'),
  num_approvers_required: z.string().or(z.number()),
  approver_sequence_rule: z.enum(['Sequential', 'Parallel']),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function ApprovalConfigurationFormPage({
  approvalConfiguration,
}: PageProps<{
  approvalConfiguration?: any;
}>) {
  const isEditing = !!approvalConfiguration;

  const defaultValues: FormValues = {
    org_size_tier: approvalConfiguration?.org_size_tier || '',
    num_approvers_required: approvalConfiguration?.num_approvers_required || 1,
    approver_sequence_rule: approvalConfiguration?.approver_sequence_rule || 'Sequential',
    status: approvalConfiguration?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? 'Edit Approval Configuration' : 'Add Approval Configuration'} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(approvalConfiguration.uuid) : store.url()}
          defaultValues={defaultValues}
          method={'post'}
          schema={schema}
          title={isEditing ? 'Edit Approval Configuration' : 'Add Approval Configuration'}
          transform={(data) => (isEditing ? { ...data, _method: 'PUT' } : data)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <XFormInput<FormValues>
              label="Organization Size Tier"
              name="org_size_tier"
              placeholder="e.g. Small, Medium, Enterprise"
            />
            <XFormInput<FormValues>
              label="Required Number of Approvers"
              name="num_approvers_required"
              type="number"
              placeholder="e.g. 1"
            />
            <XFormSelect<FormValues>
              label="Approver Sequence Rule"
              name="approver_sequence_rule"
              options={[
                { label: 'Sequential', value: 'Sequential' },
                { label: 'Parallel', value: 'Parallel' },
              ]}
            />
          </div>

          <div className="pt-4 border-t">
            <XFormSwitch<FormValues>
              label="Status"
              name="status"
              description="Activate or deactivate this configuration"
            />
          </div>
        </XLaravelForm>
      </div>
    </>
  );
}
