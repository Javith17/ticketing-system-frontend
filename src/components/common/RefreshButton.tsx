import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

/** Refresh icon button used in every list screen's header; spins while loading. */
export default function RefreshButton({ onClick, loading = false, label = 'Refresh' }: RefreshButtonProps) {
  return (
    <Tooltip title={label}>
      <span>
        <IconButton size="small" aria-label={label} onClick={onClick} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
