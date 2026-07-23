import React from 'react';
import ApprovalConfigurationFormPage from './_components/form-page';
import type { PageProps } from '@/types';

export default function EditApprovalConfiguration({
  approvalConfiguration,
}: PageProps<{
  approvalConfiguration: any;
}>) {
  return <ApprovalConfigurationFormPage approvalConfiguration={approvalConfiguration} />;
}
