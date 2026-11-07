import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Ticket, TicketDetailEntry, TicketStatus, User } from '../../types';
import StatusChip from '../common/StatusChip';
import SeverityChip from '../common/SeverityChip';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUsersByRole } from '../../redux/slices/usersSlice';
import {
  acceptTicket,
  approveClosure,
  assignRsm,
  assignTechnician,
  fetchTicketDetails,
  startTicketWork,
  updateTicketStatus,
} from '../../redux/slices/ticketsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { useHasFeature } from '../../hooks/useHasFeature';
import TicketRemarksDialog from './TicketRemarksDialog';
import TicketDetailsDialog from './TicketDetailsDialog';
import AddFindingsDialog from './AddFindingsDialog';
import CloseTicketWorkDialog from './CloseTicketWorkDialog';
import { useRoleCode } from '../../hooks/useRoleCode';

// Statuses in the technician's execution stage, which the super admin can
// also drive from the web (Accept -> Start -> Add Findings / Close).
const TECHNICIAN_STAGE: TicketStatus[] = ['Assigned Technician', 'In Progress', 'Started'];

interface TicketEditDialogProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const kvLabel = { variant: 'caption', color: 'text.secondary', sx: { textTransform: 'uppercase', fontWeight: 600, letterSpacing: '.04em' } } as const;

const STATUS_ORDER: TicketStatus[] = [
  'Under Review',
  'Open',
  'Assigned RSM',
  'Assigned Technician',
  'In Progress',
  'Started',
  'Closure Approval',
  'Ticket Closed',
];

function isAfterInProgress(status: TicketStatus): boolean {
  const idx = STATUS_ORDER.indexOf(status);
  const inProgressIdx = STATUS_ORDER.indexOf('In Progress');
  return idx !== -1 && idx > inProgressIdx;
}

export default function TicketEditDialog({ open, onClose, ticket: ticketProp }: TicketEditDialogProps) {
  const dispatch = useAppDispatch();
  // Read the live row from the store so the window follows status changes made
  // while it is open (e.g. the admin stepping Accept -> Start -> Close).
  const liveTicket = useAppSelector((s) => s.tickets.items.find((t) => t.id === ticketProp?.id));
  const ticket = ticketProp ? (liveTicket ?? ticketProp) : null;
  const isAdmin = useRoleCode() === 'ADMIN';
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [closeWorkOpen, setCloseWorkOpen] = useState(false);
  const canAssignRsm = useHasFeature('Assign RSM');
  const canAssignTechnician = useHasFeature('Assign Technician');

  const [assignees, setAssignees] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigneeError, setAssigneeError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [closureEntry, setClosureEntry] = useState<TicketDetailEntry | null>(null);
  const [closureRemarks, setClosureRemarks] = useState('');
  const [closureError, setClosureError] = useState<string | undefined>();

  useEffect(() => {
    if (!open || !ticket) return;
    setSelectedUserId('');
    setAssigneeError(undefined);
    setAssignees([]);

    if (ticket.status === 'Open') {
      dispatch(fetchUsersByRole('RSM'))
        .unwrap()
        .then(setAssignees)
        .catch(() => dispatch(showSnackbar({ message: 'Failed to load RSM users', severity: 'error' })));
    } else if (ticket.status === 'Assigned RSM') {
      dispatch(fetchUsersByRole('TECHNICIAN'))
        .unwrap()
        .then(setAssignees)
        .catch(() => dispatch(showSnackbar({ message: 'Failed to load technician users', severity: 'error' })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticket?.id, ticket?.status, dispatch]);

  // Name of the assigned technician, shown to the super admin who is acting
  // on their behalf during the execution stage.
  const inTechnicianStage = Boolean(ticket && TECHNICIAN_STAGE.includes(ticket.status));
  useEffect(() => {
    if (!open || !isAdmin || !inTechnicianStage) return;
    dispatch(fetchUsersByRole('TECHNICIAN'))
      .unwrap()
      .then(setTechnicians)
      .catch(() => setTechnicians([]));
  }, [open, isAdmin, inTechnicianStage, dispatch]);

  useEffect(() => {
    if (!open || !ticket || ticket.status !== 'Closure Approval') {
      setClosureEntry(null);
      setClosureRemarks('');
      setClosureError(undefined);
      return;
    }
    dispatch(fetchTicketDetails(ticket.id))
      .unwrap()
      .then((entries) => setClosureEntry(entries.find((e) => e.event === 'Closed') ?? null))
      .catch(() => dispatch(showSnackbar({ message: 'Failed to load closure details', severity: 'error' })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticket?.id, ticket?.status, dispatch]);

  if (!ticket) return null;

  const handleReviewed = async () => {
    setSubmitting(true);
    const result = await dispatch(updateTicketStatus({ id: ticket.id, status: 'Open' }));
    setSubmitting(false);
    if (updateTicketStatus.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket marked as reviewed', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: 'Failed to update ticket status', severity: 'error' }));
    }
  };

  const handleAssignRsm = async () => {
    if (!selectedUserId) {
      setAssigneeError('Select a user to assign');
      return;
    }
    setSubmitting(true);
    const result = await dispatch(assignRsm({ id: ticket.id, assignedRsm: selectedUserId }));
    setSubmitting(false);
    if (assignRsm.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket assigned to RSM', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: 'Failed to assign RSM', severity: 'error' }));
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedUserId) {
      setAssigneeError('Select a user to assign');
      return;
    }
    setSubmitting(true);
    const result = await dispatch(assignTechnician({ id: ticket.id, assignedTo: selectedUserId }));
    setSubmitting(false);
    if (assignTechnician.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket assigned to technician', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: 'Failed to assign technician', severity: 'error' }));
    }
  };

  const handleReturnSubmit = async (remarks: string) => {
    setSubmitting(true);
    const result = await dispatch(updateTicketStatus({ id: ticket.id, status: 'Under Review', remarks }));
    setSubmitting(false);
    if (updateTicketStatus.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket returned to Under Review', severity: 'success' }));
      setRemarksOpen(false);
      onClose();
    } else {
      dispatch(showSnackbar({ message: 'Failed to return ticket', severity: 'error' }));
    }
  };

  const handleApproveClosure = async () => {
    if (!closureRemarks.trim()) {
      setClosureError('Remarks are required');
      return;
    }
    setSubmitting(true);
    const result = await dispatch(approveClosure({ id: ticket.id, remarks: closureRemarks }));
    setSubmitting(false);
    if (approveClosure.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket closure approved', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: 'Failed to approve closure', severity: 'error' }));
    }
  };

  const handleAccept = async () => {
    setSubmitting(true);
    const result = await dispatch(acceptTicket(ticket.id));
    setSubmitting(false);
    if (acceptTicket.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket accepted', severity: 'success' }));
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to accept ticket', severity: 'error' }));
    }
  };

  const handleStartSubmit = async (remarks: string) => {
    setSubmitting(true);
    const result = await dispatch(startTicketWork({ id: ticket.id, remarks: remarks.trim() }));
    setSubmitting(false);
    if (startTicketWork.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Work started', severity: 'success' }));
      setStartOpen(false);
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to start work', severity: 'error' }));
    }
  };

  const technician = technicians.find((t) => t.id === ticket.assignedTo);
  const kv = [
    { k: 'Ticket ID', v: ticket.complaintId },
    { k: 'Issue', v: ticket.title },
    ...(isAdmin && inTechnicianStage
      ? [
          {
            k: 'Assigned technician',
            v: technician ? `${technician.firstName} ${technician.lastName}`.trim() : ticket.assignedTo ? '…' : '-',
          },
        ]
      : []),
  ];

  const renderActions = () => {
    if (ticket.status === 'Under Review') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleReviewed} disabled={submitting}>
            Reviewed
          </Button>
        </>
      );
    }

    if (ticket.status === 'Open') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {canAssignRsm && (
            <Button variant="outlined" onClick={handleAssignRsm} disabled={submitting}>
              Assign RSM
            </Button>
          )}
          <Button variant="contained" color="warning" onClick={() => setRemarksOpen(true)} disabled={submitting}>
            Return
          </Button>
        </>
      );
    }

    if (ticket.status === 'Assigned RSM') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {canAssignTechnician && (
            <Button variant="contained" onClick={handleAssignTechnician} disabled={submitting}>
              Assign Technician
            </Button>
          )}
        </>
      );
    }

    // Technician execution stage, driven by the super admin from the web.
    if (isAdmin && ticket.status === 'Assigned Technician') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAccept} disabled={submitting}>
            Accept
          </Button>
        </>
      );
    }

    if (isAdmin && ticket.status === 'In Progress') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setStartOpen(true)} disabled={submitting}>
            Start
          </Button>
        </>
      );
    }

    if (isAdmin && ticket.status === 'Started') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => setFindingsOpen(true)} disabled={submitting}>
            Add Findings
          </Button>
          <Button variant="contained" onClick={() => setCloseWorkOpen(true)} disabled={submitting}>
            Close Ticket
          </Button>
        </>
      );
    }

    if (ticket.status === 'Closure Approval' && canAssignRsm) {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleApproveClosure} disabled={submitting}>
            Approve
          </Button>
        </>
      );
    }

    return (
      <Button onClick={onClose} color="inherit">
        Close
      </Button>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {ticket.complaintId}
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {kv.map((item) => (
              <Grid key={item.k} size={{ xs: 12, sm: 6 }}>
                <Typography {...kvLabel}>{item.k}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {item.v}
                </Typography>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography {...kvLabel}>Status</Typography>
              <Box sx={{ mt: 0.5 }}>
                <StatusChip status={ticket.status} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography {...kvLabel}>Priority</Typography>
              <Box sx={{ mt: 0.5 }}>
                <SeverityChip severity={ticket.severity} />
              </Box>
            </Grid>
            <Grid size={12}>
              <Typography {...kvLabel}>Description</Typography>
              <Typography variant="body2">{ticket.description}</Typography>
            </Grid>
          </Grid>

          {(ticket.status === 'Open' || ticket.status === 'Assigned RSM') && (
            <TextField
              select
              fullWidth
              label={ticket.status === 'Open' ? 'Assign To (RSM)' : 'Assign Technician'}
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setAssigneeError(undefined);
              }}
              error={Boolean(assigneeError)}
              helperText={assigneeError}
              sx={{ mt: 3 }}
            >
              {assignees.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {`${u.firstName} ${u.lastName}`.trim()}
                </MenuItem>
              ))}
              {assignees.length === 0 && (
                <MenuItem value="" disabled>
                  No users available
                </MenuItem>
              )}
            </TextField>
          )}

          {ticket.status === 'Closure Approval' && (
            <Box sx={{ mt: 3 }}>
              <Typography {...kvLabel}>Closure details</Typography>
              {closureEntry ? (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {closureEntry.remarks}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Loading…
                </Typography>
              )}
              {canAssignRsm && (
                <TextField
                  label="Approval remarks"
                  fullWidth
                  multiline
                  rows={2}
                  value={closureRemarks}
                  onChange={(e) => {
                    setClosureRemarks(e.target.value);
                    setClosureError(undefined);
                  }}
                  error={Boolean(closureError)}
                  helperText={closureError}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {isAfterInProgress(ticket.status) && (
            <Button onClick={() => setDetailsOpen(true)} sx={{ mr: 'auto' }}>
              Ticket Details
            </Button>
          )}
          {renderActions()}
        </DialogActions>
      </Dialog>

      <TicketRemarksDialog
        open={remarksOpen}
        onClose={() => setRemarksOpen(false)}
        title={`Return ${ticket.complaintId}`}
        submitLabel="Submit"
        submitting={submitting}
        onSubmit={handleReturnSubmit}
      />

      <TicketRemarksDialog
        open={startOpen}
        onClose={() => setStartOpen(false)}
        title={`Start work — ${ticket.complaintId}`}
        submitLabel="Start"
        submitting={submitting}
        onSubmit={handleStartSubmit}
      />

      <AddFindingsDialog
        open={findingsOpen}
        onClose={() => setFindingsOpen(false)}
        ticketId={ticket.id}
        ticketLabel={ticket.complaintId}
      />

      <CloseTicketWorkDialog
        open={closeWorkOpen}
        onClose={() => setCloseWorkOpen(false)}
        ticketId={ticket.id}
        ticketLabel={ticket.complaintId}
      />

      <TicketDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        ticketId={ticket.id}
        ticketLabel={ticket.complaintId}
      />
    </>
  );
}
