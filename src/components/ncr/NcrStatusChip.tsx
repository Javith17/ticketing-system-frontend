import { Chip } from '@mui/material';
import type { NcrStatus } from '../../types';

const colorMap: Record<NcrStatus, 'primary' | 'warning' | 'default' | 'info' | 'secondary' | 'success' | 'error'> = {
  'In-Review': 'warning',
  Approved: 'info',
  Rejected: 'error',
  Material_request_Initiated: 'secondary',
  Material_request_approved: 'secondary',
  Material_issued: 'info',
  Material_received: 'info',
  Item_returned: 'warning',
  Return_dispositioned: 'info',
  'Technician Closed': 'primary',
  'PM Closed': 'primary',
  Closed: 'success',
};

export default function NcrStatusChip({ status }: { status: NcrStatus }) {
  return <Chip label={status} color={colorMap[status] ?? 'default'} size="small" variant="outlined" />;
}
