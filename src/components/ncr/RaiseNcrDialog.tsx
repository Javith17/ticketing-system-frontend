import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../redux/hooks';
import { raiseNcr } from '../../redux/slices/ncrSlice';
import { fetchTicketsByStatus } from '../../redux/slices/ticketsSlice';
import { fetchUsersByRole } from '../../redux/slices/usersSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import type { Ticket, User } from '../../types';
import { required } from '../../utils/validators';

interface RaiseNcrDialogProps {
  open: boolean;
  onClose: () => void;
}

const technicianLabel = (u: User) =>
  `${[u.firstName, u.lastName].filter(Boolean).join(' ')}${u.employeeCode ? ` (${u.employeeCode})` : ''}`;

/**
 * Super admin only: raise an NCR on behalf of a technician. Mirrors the
 * mobile app, where a technician raises an NCR from a ticket they have
 * Started - so the ticket picker lists Started tickets, and the technician
 * defaults to whoever the chosen ticket is assigned to.
 */
export default function RaiseNcrDialog({ open, onClose }: RaiseNcrDialogProps) {
  const dispatch = useAppDispatch();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [technicianId, setTechnicianId] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ ticket?: string; technician?: string; description?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTicket(null);
    setTechnicianId('');
    setDescription('');
    setErrors({});
    setLoading(true);
    Promise.all([
      dispatch(fetchTicketsByStatus('Started')).unwrap(),
      dispatch(fetchUsersByRole('TECHNICIAN')).unwrap(),
    ])
      .then(([startedTickets, techs]) => {
        setTickets(startedTickets);
        setTechnicians(techs.filter((t) => t.isActive !== false));
      })
      .catch(() => dispatch(showSnackbar({ message: 'Failed to load tickets or technicians', severity: 'error' })))
      .finally(() => setLoading(false));
  }, [open, dispatch]);

  const technicianIds = useMemo(() => new Set(technicians.map((t) => t.id)), [technicians]);

  const handleTicketChange = (next: Ticket | null) => {
    setTicket(next);
    setErrors((e) => ({ ...e, ticket: undefined }));
    // Pre-select the technician the ticket is assigned to (still editable).
    if (next?.assignedTo && technicianIds.has(next.assignedTo)) {
      setTechnicianId(next.assignedTo);
      setErrors((e) => ({ ...e, technician: undefined }));
    }
  };

  const handleSubmit = async () => {
    const nextErrors = {
      ticket: ticket ? undefined : 'Select a ticket',
      technician: technicianId ? undefined : 'Select a technician',
      description: required(description, 'Description'),
    };
    setErrors(nextErrors);
    if (nextErrors.ticket || nextErrors.technician || nextErrors.description || !ticket) return;

    setSubmitting(true);
    const result = await dispatch(raiseNcr({ ticketId: ticket.id, technicianId, description: description.trim() }));
    setSubmitting(false);
    if (raiseNcr.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: `${result.payload.ticketNo} raised`, severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to raise NCR', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Raise NCR
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          The NCR is recorded as raised by the selected technician. It appears in their NCR list in the field ops
          app, and they are notified.
        </Typography>
        <Autocomplete
          options={tickets}
          value={ticket}
          loading={loading}
          onChange={(_, value) => handleTicketChange(value)}
          getOptionLabel={(t) => `${t.complaintId} — ${t.title}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          noOptionsText={loading ? 'Loading…' : 'No tickets in Started status'}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ticket"
              placeholder="Search Started tickets"
              error={Boolean(errors.ticket)}
              helperText={errors.ticket ?? 'Only tickets a technician has Started can have an NCR raised'}
            />
          )}
        />
        <TextField
          select
          label="Technician"
          value={technicianId}
          onChange={(e) => {
            setTechnicianId(e.target.value);
            setErrors((er) => ({ ...er, technician: undefined }));
          }}
          error={Boolean(errors.technician)}
          helperText={errors.technician}
          disabled={loading}
        >
          {technicians.length === 0 && (
            <MenuItem value="" disabled>
              No active technicians
            </MenuItem>
          )}
          {technicians.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {technicianLabel(t)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Description"
          placeholder="Describe the non-conformance"
          multiline
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((er) => ({ ...er, description: undefined }));
          }}
          error={Boolean(errors.description)}
          helperText={errors.description}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting || loading}>
          Raise NCR
        </Button>
      </DialogActions>
    </Dialog>
  );
}
