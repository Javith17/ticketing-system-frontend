import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../redux/hooks';
import { recordDisposition } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { NCR_RETURN_DISPOSITIONS, type NcrMaterialRequest } from '../../types';

interface DispositionDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketNo: string;
  materialRequest: NcrMaterialRequest | null;
}

/** Stores records what happens to each returned item - process flow step #44. */
export default function DispositionDialog({ open, onClose, ncrTicketNo, materialRequest }: DispositionDialogProps) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<Record<string, { disposition: string; remarks: string }>>({});
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && materialRequest) {
      const initial: Record<string, { disposition: string; remarks: string }> = {};
      materialRequest.returns.forEach((r) => {
        initial[r.id] = { disposition: '', remarks: '' };
      });
      setValues(initial);
      setError(undefined);
    }
  }, [open, materialRequest]);

  const handleSubmit = async () => {
    if (!materialRequest) return;
    const missing = materialRequest.returns.find((r) => !values[r.id]?.disposition);
    if (missing) {
      setError(`Choose a disposition for '${missing.itemName}'`);
      return;
    }
    setSubmitting(true);
    const result = await dispatch(
      recordDisposition({
        materialRequestId: materialRequest.id,
        ncrTicketId: materialRequest.ncrTicketId,
        items: materialRequest.returns.map((r) => ({
          returnId: r.id,
          disposition: values[r.id].disposition,
          remarks: values[r.id].remarks.trim() || undefined,
        })),
      }),
    );
    setSubmitting(false);
    if (recordDisposition.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Disposition recorded', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to record disposition', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Record disposition — {ncrTicketNo}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {materialRequest?.returns.map((r, idx) => (
          <Box key={r.id}>
            {idx > 0 && <Divider sx={{ my: 2 }} />}
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {r.itemName} × {r.quantity}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
              {[r.serialNo && `Serial ${r.serialNo}`, r.batchNo && `Batch ${r.batchNo}`, r.conditionRemarks]
                .filter(Boolean)
                .join(' · ') || 'No serial / batch recorded'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField
                select
                size="small"
                label="Disposition"
                value={values[r.id]?.disposition ?? ''}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, [r.id]: { ...prev[r.id], disposition: e.target.value } }));
                  setError(undefined);
                }}
              >
                {NCR_RETURN_DISPOSITIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Remarks (optional)"
                value={values[r.id]?.remarks ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [r.id]: { ...prev[r.id], remarks: e.target.value } }))}
              />
            </Box>
          </Box>
        ))}
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !materialRequest}>
          Record Disposition
        </Button>
      </DialogActions>
    </Dialog>
  );
}
