import { Chip } from '@mui/material';
import type { TicketStatus } from '../../types';

const colorMap: Record<TicketStatus, 'primary' | 'warning' | 'default' | 'info' | 'secondary' | 'success'> = {
  Open: 'primary',
  'In Progress': 'warning',
  Closed: 'default',
  'Under Review': 'warning',
  'Assigned RSM': 'info',
  'Assigned Technician': 'secondary',
  Started: 'secondary',
  'Closure Approval': 'warning',
  'Ticket Closed': 'success',
};

export default function StatusChip({ status }: { status: TicketStatus }) {
  return <Chip label={status} color={colorMap[status]} size="small" variant="outlined" />;
}
