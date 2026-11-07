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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Box,
  Checkbox,
  ListItemText,
  Autocomplete,
  type SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Role } from '../../types';
import { required, hasErrors, type FieldErrors } from '../../utils/validators';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createRole, updateRole } from '../../redux/slices/rolesSlice';
import { fetchFeatures } from '../../redux/slices/featuresSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

export type RoleDialogMode = 'create' | 'edit' | 'view';

type RoleField = 'roleCode' | 'roleName' | 'features';

interface FormState {
  roleCode: string;
  roleName: string;
  features: string[];
  approvals: string[];
}

const emptyForm: FormState = { roleCode: '', roleName: '', features: [], approvals: [] };

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: RoleDialogMode;
  role?: Role | null;
}

export default function RoleFormDialog({ open, onClose, mode, role }: RoleFormDialogProps) {
  const dispatch = useAppDispatch();
  const { items: features, status: featuresStatus } = useAppSelector((state) => state.features);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<RoleField>>({});
  const [submitting, setSubmitting] = useState(false);
  const readOnly = mode === 'view';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (featuresStatus !== 'succeeded' && featuresStatus !== 'loading') dispatch(fetchFeatures());
      setForm(
        role
          ? {
              roleCode: role.roleCode,
              roleName: role.roleName,
              features: role.features,
              approvals: role.approvals,
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, role, featuresStatus, dispatch]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors<RoleField> = {
      roleCode: required(form.roleCode, 'Role code'),
      roleName: required(form.roleName, 'Role name'),
      features: form.features.length === 0 ? 'Select at least one feature' : undefined,
    };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleSubmit = async () => {
    if (readOnly) {
      onClose();
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    if (isEdit && role) {
      const result = await dispatch(updateRole({ ...role, ...form }));
      setSubmitting(false);
      if (updateRole.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Role updated', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to update role', severity: 'error' }));
      }
    } else {
      const result = await dispatch(createRole(form));
      setSubmitting(false);
      if (createRole.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Role added', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to add role', severity: 'error' }));
      }
    }
  };

  const title = mode === 'view' ? 'View role' : mode === 'edit' ? 'Edit role' : 'Add new role';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Role code"
              placeholder="e.g. RL-001"
              fullWidth
              value={form.roleCode}
              onChange={(e) => setField('roleCode', e.target.value)}
              error={Boolean(errors.roleCode)}
              helperText={errors.roleCode || (isEdit ? 'Cannot be changed after creation' : undefined)}
              disabled={readOnly || isEdit}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Role name"
              placeholder="e.g. Assistant Engineer"
              fullWidth
              value={form.roleName}
              onChange={(e) => setField('roleName', e.target.value)}
              error={Boolean(errors.roleName)}
              helperText={errors.roleName}
              disabled={readOnly}
            />
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth error={Boolean(errors.features)} disabled={readOnly}>
              <InputLabel id="role-features-label">Features</InputLabel>
              <Select<string[]>
                labelId="role-features-label"
                multiple
                label="Features"
                value={form.features}
                onChange={(e: SelectChangeEvent<string[]>) =>
                  setField('features', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((name) => (
                      <Chip key={name} label={name} size="small" />
                    ))}
                  </Box>
                )}
              >
                {features.map((f) => (
                  <MenuItem key={f.id} value={f.feature}>
                    <Checkbox checked={form.features.includes(f.feature)} size="small" />
                    <ListItemText primary={f.feature} secondary={f.isApproval ? 'Requires approval' : undefined} />
                  </MenuItem>
                ))}
              </Select>
              {errors.features && (
                <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5, ml: 1.75 }}>{errors.features}</Box>
              )}
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.approvals}
              onChange={(_, value) => setField('approvals', value as string[])}
              disabled={readOnly}
              renderValue={(value, getItemProps) =>
                value.map((option, index) => {
                  const { key, ...itemProps } = getItemProps({ index });
                  return <Chip key={key} label={option} size="small" {...itemProps} />;
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Approvals" placeholder="Type an approval label and press Enter" />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {readOnly ? (
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
              Submit
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
