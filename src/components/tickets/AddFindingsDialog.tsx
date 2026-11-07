import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../redux/hooks';
import { addTicketFindings } from '../../redux/slices/ticketsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { required } from '../../utils/validators';
import PhotoPicker from '../ncr/PhotoPicker';

interface AddFindingsDialogProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  ticketLabel: string;
}

/**
 * Web equivalent of the field ops app's "Add findings" screen, used by the
 * super admin on a Started ticket: remarks (required), test values and up to
 * 3 photos. Log-only - the ticket stays Started and findings can be added
 * more than once.
 */
export default function AddFindingsDialog({ open, onClose, ticketId, ticketLabel }: AddFindingsDialogProps) {
  const dispatch = useAppDispatch();
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState<string | undefined>();
  const [testValues, setTestValues] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRemarks('');
      setRemarksError(undefined);
      setTestValues('');
      setFiles([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    const err = required(remarks, 'Remarks');
    setRemarksError(err);
    if (err) return;
    setSubmitting(true);
    const result = await dispatch(
      addTicketFindings({ id: ticketId, remarks: remarks.trim(), testValues: testValues.trim() || undefined, attachments: files }),
    );
    setSubmitting(false);
    if (addTicketFindings.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Findings added', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to add findings', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Add findings — {ticketLabel}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Remarks"
          placeholder="Describe the findings"
          fullWidth
          multiline
          rows={3}
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            setRemarksError(undefined);
          }}
          error={Boolean(remarksError)}
          helperText={remarksError}
        />
        <TextField
          label="Test values (optional)"
          placeholder="Recorded readings / values"
          fullWidth
          multiline
          rows={2}
          value={testValues}
          onChange={(e) => setTestValues(e.target.value)}
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
          Add Findings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
