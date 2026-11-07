import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { required } from '../../utils/validators';

interface TicketRemarksDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (remarks: string) => void;
}

export default function TicketRemarksDialog({
  open,
  onClose,
  title = 'Return ticket',
  submitLabel = 'Submit',
  submitting = false,
  onSubmit,
}: TicketRemarksDialogProps) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setRemarks('');
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = () => {
    const err = required(remarks, 'Remarks');
    setError(err);
    if (err) return;
    onSubmit(remarks);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Remarks"
          placeholder="Explain why this ticket is being returned"
          fullWidth
          multiline
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
