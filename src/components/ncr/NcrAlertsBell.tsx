import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchAlerts,
  fetchUnseenAlertCount,
  markAlertsSeen,
  raiseNcrFromAlert,
  type NcrAlert,
} from '../../redux/slices/ncrAlertsSlice';
import { fetchNcrDetail } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { useRoleCode } from '../../hooks/useRoleCode';

const POLL_INTERVAL_MS = 30000;

interface NcrAlertsBellProps {
  onViewNcr?: (ncrTicketId: string) => void;
}

export default function NcrAlertsBell({ onViewNcr }: NcrAlertsBellProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const roleCode = useRoleCode();
  const isAdmin = roleCode === 'ADMIN';
  const { items, unseenCount } = useAppSelector((state) => state.ncrAlerts);
  const [open, setOpen] = useState(false);
  const [raisingId, setRaisingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUnseenAlertCount());
    const interval = setInterval(() => dispatch(fetchUnseenAlertCount()), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
    dispatch(fetchAlerts());
    if (unseenCount > 0) dispatch(markAlertsSeen());
  };

  const handleClose = () => setOpen(false);

  const handleViewTickets = (alert: NcrAlert) => {
    setOpen(false);
    const params = new URLSearchParams({ scope: alert.scope, name: alert.entityName });
    if (alert.entityId != null) params.set('entityId', String(alert.entityId));
    navigate(`/tickets?${params.toString()}`);
  };

  const handleRaiseNcr = async (alert: NcrAlert) => {
    setRaisingId(alert.id);
    const result = await dispatch(raiseNcrFromAlert(alert.id));
    setRaisingId(null);
    if (raiseNcrFromAlert.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'NCR raised', severity: 'success' }));
    } else {
      dispatch(showSnackbar({ message: 'Failed to raise NCR', severity: 'error' }));
    }
  };

  const handleViewNcr = async (alert: NcrAlert) => {
    if (!alert.ncrTicketId) return;
    await dispatch(fetchNcrDetail(alert.ncrTicketId));
    setOpen(false);
    onViewNcr?.(alert.ncrTicketId);
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unseenCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          NCR threshold alerts
          <IconButton onClick={handleClose} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {items.length === 0 && (
            <Box sx={{ px: 3, py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No alerts yet.
              </Typography>
            </Box>
          )}
          <List dense disablePadding>
            {items.map((alert) => (
              <ListItem
                key={alert.id}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => handleViewTickets(alert)}>
                      View tickets
                    </Button>
                    {isAdmin &&
                      (alert.ncrTicketId ? (
                        <Button size="small" variant="outlined" color="success" onClick={() => handleViewNcr(alert)}>
                          View NCR
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          disabled={raisingId === alert.id}
                          onClick={() => handleRaiseNcr(alert)}
                        >
                          Raise NCR
                        </Button>
                      ))}
                  </Stack>
                }
                sx={{ py: 1.5, pr: isAdmin ? 26 : 16 }}
              >
                <ListItemText
                  primary={`${alert.scope}: ${alert.entityName}`}
                  secondary={`${alert.ticketCount} tickets in the last ${alert.windowDays} days · ${new Date(alert.alertDate).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
