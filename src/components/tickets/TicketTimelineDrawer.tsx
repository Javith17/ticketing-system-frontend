import { useEffect, useState } from 'react';
import { Drawer, Box, Typography, IconButton, Divider, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { TicketHistoryEntry } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { fetchTicketHistory } from '../../redux/slices/ticketsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { formatDateTime } from '../../utils/format';

interface TicketTimelineDrawerProps {
  open: boolean;
  onClose: () => void;
  ticketId: string | null;
  ticketLabel?: string;
}

export default function TicketTimelineDrawer({ open, onClose, ticketId, ticketLabel }: TicketTimelineDrawerProps) {
  const dispatch = useAppDispatch();
  const [entries, setEntries] = useState<TicketHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !ticketId) return;
    setLoading(true);
    dispatch(fetchTicketHistory(ticketId))
      .unwrap()
      .then(setEntries)
      .catch(() => dispatch(showSnackbar({ message: 'Failed to load ticket timeline', severity: 'error' })))
      .finally(() => setLoading(false));
  }, [open, ticketId, dispatch]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Timeline {ticketLabel ? `— ${ticketLabel}` : ''}
          </Typography>
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : entries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No history recorded for this ticket yet.
            </Typography>
          ) : (
            <Box sx={{ pl: 1 }}>
              {entries.map((entry, i) => (
                <Box key={entry.id} sx={{ display: 'flex', gap: 1.5, pb: i === entries.length - 1 ? 0 : 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FiberManualRecordIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    {i !== entries.length - 1 && <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {entry.eventUserName || 'System'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {formatDateTime(entry.eventAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {entry.eventDetail}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
