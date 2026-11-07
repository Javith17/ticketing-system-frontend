import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box, Typography, Divider, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { TicketDetailEntry } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { fetchTicketDetails } from '../../redux/slices/ticketsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { formatDateTime } from '../../utils/format';
import { API_BASE_URL } from '../../utils/env';

interface TicketDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  ticketId: string | null;
  ticketLabel?: string;
}

export default function TicketDetailsDialog({ open, onClose, ticketId, ticketLabel }: TicketDetailsDialogProps) {
  const dispatch = useAppDispatch();
  const [entries, setEntries] = useState<TicketDetailEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !ticketId) return;
    setLoading(true);
    dispatch(fetchTicketDetails(ticketId))
      .unwrap()
      .then(setEntries)
      .catch(() => dispatch(showSnackbar({ message: 'Failed to load ticket details', severity: 'error' })))
      .finally(() => setLoading(false));
  }, [open, ticketId, dispatch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Ticket details {ticketLabel ? `— ${ticketLabel}` : ''}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No execution details recorded for this ticket yet.
          </Typography>
        ) : (
          entries.map((entry, i) => (
            <Box key={entry.id} sx={{ mb: i === entries.length - 1 ? 0 : 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {entry.event}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {entry.eventByName || 'System'} · {formatDateTime(entry.eventAt)}
              </Typography>
              {entry.remarks && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {entry.remarks}
                </Typography>
              )}
              {entry.testValues && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Test values: {entry.testValues}
                </Typography>
              )}
              {entry.attachments.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {entry.attachments.map((path) => (
                    <a key={path} href={`${API_BASE_URL}/${path.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer">
                      <Box
                        component="img"
                        src={`${API_BASE_URL}/${path.replace(/\\/g, '/')}`}
                        alt="attachment"
                        sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                      />
                    </a>
                  ))}
                </Box>
              )}
              {i !== entries.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
