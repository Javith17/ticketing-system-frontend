import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, IconButton, Divider, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Asset } from '../../types';
import { required, hasErrors, type FieldErrors } from '../../utils/validators';
import { useAppDispatch } from '../../redux/hooks';
import { createAsset, updateAsset } from '../../redux/slices/assetsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import AssetBarcode from './AssetBarcode';

type AssetField = 'name' | 'panel';

interface FormState {
  name: string;
  panel: string;
  site: string;
  location: string;
  coordinates: string;
  description: string;
  barcode: string;
}

const emptyForm: FormState = {
  name: '',
  panel: '',
  site: '',
  location: '',
  coordinates: '',
  description: '',
  barcode: '',
};

interface AssetFormDialogProps {
  open: boolean;
  onClose: () => void;
  editAsset?: Asset | null;
}

export default function AssetFormDialog({ open, onClose, editAsset }: AssetFormDialogProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<AssetField>>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editAsset);

  useEffect(() => {
    if (open) {
      setForm(
        editAsset
          ? {
              name: editAsset.name,
              panel: editAsset.panel,
              site: editAsset.site ?? '',
              location: editAsset.location ?? '',
              coordinates: editAsset.coordinates ?? '',
              description: editAsset.description ?? '',
              barcode: editAsset.barcode ?? '',
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, editAsset]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors<AssetField> = {
      name: required(form.name, 'Asset name'),
      panel: required(form.panel, 'Panel'),
    };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    if (isEdit && editAsset) {
      const result = await dispatch(updateAsset({ ...editAsset, ...form }));
      setSubmitting(false);
      if (updateAsset.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Asset updated', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: 'Failed to update asset', severity: 'error' }));
      }
    } else {
      const result = await dispatch(createAsset(form));
      setSubmitting(false);
      if (createAsset.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Asset added', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: 'Failed to add asset', severity: 'error' }));
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {isEdit ? 'Edit asset' : 'Add new asset'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Asset name"
              placeholder="e.g. Asset 101"
              fullWidth
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Panel"
              placeholder="e.g. P-01"
              fullWidth
              value={form.panel}
              onChange={(e) => setField('panel', e.target.value)}
              error={Boolean(errors.panel)}
              helperText={errors.panel}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Site"
              placeholder="e.g. Site A"
              fullWidth
              value={form.site}
              onChange={(e) => setField('site', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Location"
              placeholder="e.g. North Block"
              fullWidth
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Coordinates"
              placeholder="e.g. 12.9716, 77.5946"
              fullWidth
              value={form.coordinates}
              onChange={(e) => setField('coordinates', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Barcode"
              placeholder="e.g. 8901234567890"
              fullWidth
              value={form.barcode}
              onChange={(e) => setField('barcode', e.target.value)}
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
              onChange={(e) => setField('description', e.target.value)}
            />
          </Grid>
        </Grid>

        {isEdit && editAsset && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textAlign: 'center', mb: 1.5 }}>
              Barcode
            </Typography>
            <AssetBarcode value={form.barcode || editAsset.id} />
          </>
        )}
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
