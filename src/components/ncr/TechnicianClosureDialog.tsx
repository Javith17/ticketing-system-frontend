import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../redux/hooks';
import { technicianCloseNcr } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { required } from '../../utils/validators';
import PhotoPicker from './PhotoPicker';

interface TechnicianClosureDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketId: string;
  ncrTicketNo: string;
  // True when closing straight from Material_received, i.e. without
  // returning a failed item to Stores.
  withoutReturn?: boolean;
}

/**
 * Web equivalent of the field ops app's technician "Submit Closure" sheet,
 * used by the super admin once the material has been received (and any
 * failed item returned and dispositioned): closure remarks plus up to 3 photos.
 */
export default function TechnicianClosureDialog({
  open,
  onClose,
  ncrTicketId,
  ncrTicketNo,
  withoutReturn = false,
}: TechnicianClosureDialogProps) {
  const dispatch = useAppDispatch();
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState<string | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRemarks('');
      setRemarksError(undefined);
      setFiles([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    const err = required(remarks, 'Closure remarks');
    setRemarksError(err);
    if (err) return;
    setSubmitting(true);
    const result = await dispatch(technicianCloseNcr({ id: ncrTicketId, remarks: remarks.trim(), attachments: files }));
    setSubmitting(false);
    if (technicianCloseNcr.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Closure submitted', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to submit closure', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Submit closure — {ncrTicketNo}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {withoutReturn && (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Submitting closure now confirms there is no failed item to return to Stores.
          </Alert>
        )}
        <TextField
          label="Closure remarks"
          placeholder="Describe the corrective work done"
          fullWidth
          multiline
          rows={4}
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            setRemarksError(undefined);
          }}
          error={Boolean(remarksError)}
          helperText={remarksError}
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
          Submit Closure
        </Button>
      </DialogActions>
    </Dialog>
  );
}
