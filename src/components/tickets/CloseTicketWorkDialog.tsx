import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../redux/hooks';
import { closeTicketWork } from '../../redux/slices/ticketsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { required } from '../../utils/validators';
import PhotoPicker from '../ncr/PhotoPicker';

interface CloseTicketWorkDialogProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  ticketLabel: string;
}

/**
 * Web equivalent of the field ops app's technician "Close ticket" screen,
 * used by the super admin on a Started ticket: description and remarks (both
 * required, as in the app) and up to 3 photos. Moves the ticket to Closure
 * Approval and notifies PM_DH.
 */
export default function CloseTicketWorkDialog({ open, onClose, ticketId, ticketLabel }: CloseTicketWorkDialogProps) {
  const dispatch = useAppDispatch();
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<{ description?: string; remarks?: string }>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDescription('');
      setRemarks('');
      setErrors({});
      setFiles([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    const next = { description: required(description, 'Description'), remarks: required(remarks, 'Remarks') };
    setErrors(next);
    if (next.description || next.remarks) return;
    setSubmitting(true);
    const result = await dispatch(
      closeTicketWork({ id: ticketId, description: description.trim(), remarks: remarks.trim(), attachments: files }),
    );
    setSubmitting(false);
    if (closeTicketWork.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Ticket sent for closure approval', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to close ticket', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Close ticket — {ticketLabel}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Description"
          placeholder="What was done"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((er) => ({ ...er, description: undefined }));
          }}
          error={Boolean(errors.description)}
          helperText={errors.description}
        />
        <TextField
          label="Remarks"
          placeholder="Additional remarks"
          fullWidth
          multiline
          rows={2}
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            setErrors((er) => ({ ...er, remarks: undefined }));
          }}
          error={Boolean(errors.remarks)}
          helperText={errors.remarks}
          sx={{ mt: 2.5 }}
        />
        <Box sx={{ mt: 2.5 }}>
          <PhotoPicker files={files} onChange={setFiles} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          Close Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
}
