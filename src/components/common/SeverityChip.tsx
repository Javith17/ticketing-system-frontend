import { Chip } from '@mui/material';
import type { Severity } from '../../types';

const colorMap: Record<Severity, 'error' | 'warning' | 'success' | 'info'> = {
  Critical: 'error',
  High: 'warning',
  Medium: 'info',
  Low: 'success',
};

export default function SeverityChip({ severity }: { severity: Severity }) {
  return <Chip label={severity} color={colorMap[severity]} size="small" variant="outlined" />;
}
