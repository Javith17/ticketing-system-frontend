import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Feature } from '../../types';
import { required, hasErrors, type FieldErrors } from '../../utils/validators';
import { useAppDispatch } from '../../redux/hooks';
import { createFeature, updateFeature } from '../../redux/slices/featuresSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

type FeatureField = 'feature';

interface FormState {
  feature: string;
  isApproval: boolean;
}

const emptyForm: FormState = { feature: '', isApproval: false };

interface FeatureFormDialogProps {
  open: boolean;
  onClose: () => void;
  editFeature?: Feature | null;
}

export default function FeatureFormDialog({ open, onClose, editFeature }: FeatureFormDialogProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<FeatureField>>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editFeature);

  useEffect(() => {
    if (open) {
      setForm(editFeature ? { feature: editFeature.feature, isApproval: editFeature.isApproval } : emptyForm);
      setErrors({});
    }
  }, [open, editFeature]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors<FeatureField> = {
      feature: required(form.feature, 'Feature name'),
    };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    if (isEdit && editFeature) {
      const result = await dispatch(updateFeature({ ...editFeature, ...form }));
      setSubmitting(false);
      if (updateFeature.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Feature updated', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to update feature', severity: 'error' }));
      }
    } else {
      const result = await dispatch(createFeature(form));
      setSubmitting(false);
      if (createFeature.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Feature added', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to add feature', severity: 'error' }));
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {isEdit ? 'Edit feature' : 'Add new feature'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Feature name"
              placeholder="e.g. Ticket Management"
              fullWidth
              value={form.feature}
              onChange={(e) => setField('feature', e.target.value)}
              error={Boolean(errors.feature)}
              helperText={errors.feature}
            />
          </Grid>
          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch checked={form.isApproval} onChange={(e) => setField('isApproval', e.target.checked)} />
              }
              label="Requires approval"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
