import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Source } from '../../types';
import { required, hasErrors, type FieldErrors } from '../../utils/validators';
import { useAppDispatch } from '../../redux/hooks';
import { createSource, fetchSources, updateSource } from '../../redux/slices/sourcesSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

type SourceField = 'sourceName';

interface FormState {
  sourceName: string;
  description: string;
}

const emptyForm: FormState = { sourceName: '', description: '' };

interface SourceFormDialogProps {
  open: boolean;
  onClose: () => void;
  editSource?: Source | null;
}

export default function SourceFormDialog({ open, onClose, editSource }: SourceFormDialogProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<SourceField>>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editSource);

  useEffect(() => {
    if (open) {
      setForm(
        editSource ? { sourceName: editSource.sourceName, description: editSource.description ?? '' } : emptyForm
      );
      setErrors({});
    }
  }, [open, editSource]);

  const validate = (): boolean => {
    const nextErrors: FieldErrors<SourceField> = { sourceName: required(form.sourceName, 'Source name') };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    if (isEdit && editSource) {
      const result = await dispatch(
        updateSource({ ...editSource, sourceName: form.sourceName, description: form.description })
      );
      setSubmitting(false);
      if (updateSource.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Source updated', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: 'Failed to update source', severity: 'error' }));
      }
    } else {
      const result = await dispatch(createSource({ sourceName: form.sourceName, description: form.description }));
      setSubmitting(false);
      if (createSource.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Source added', severity: 'success' }));
        dispatch(fetchSources());
        onClose();
      } else {
        dispatch(showSnackbar({ message: 'Failed to add source', severity: 'error' }));
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {isEdit ? 'Edit source' : 'Add new source'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Source name"
              placeholder="e.g. Mobile App"
              fullWidth
              value={form.sourceName}
              onChange={(e) => setForm((prev) => ({ ...prev, sourceName: e.target.value }))}
              error={Boolean(errors.sourceName)}
              helperText={errors.sourceName}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Description"
              placeholder="Optional description"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
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
