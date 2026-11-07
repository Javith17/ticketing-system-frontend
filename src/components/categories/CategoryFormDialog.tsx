import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Category } from '../../types';
import { required, hasErrors, type FieldErrors } from '../../utils/validators';
import { useAppDispatch } from '../../redux/hooks';
import { createCategory, fetchCategories, updateCategory } from '../../redux/slices/categoriesSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

type CategoryField = 'categoryCode' | 'name';

interface FormState {
  categoryCode: string;
  name: string;
  description: string;
}

const emptyForm: FormState = { categoryCode: '', name: '', description: '' };

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  editCategory?: Category | null;
}

export default function CategoryFormDialog({ open, onClose, editCategory }: CategoryFormDialogProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<CategoryField>>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editCategory);

  useEffect(() => {
    if (open) {
      setForm(
        editCategory
          ? { categoryCode: editCategory.categoryCode, name: editCategory.name, description: editCategory.description ?? '' }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, editCategory]);

  const validate = (): boolean => {
    const nextErrors: FieldErrors<CategoryField> = {
      categoryCode: required(form.categoryCode, 'Category code'),
      name: required(form.name, 'Category name'),
    };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    if (isEdit && editCategory) {
      const result = await dispatch(
        updateCategory({ ...editCategory, categoryCode: form.categoryCode, name: form.name, description: form.description })
      );
      setSubmitting(false);
      if (updateCategory.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Category updated', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: 'Failed to update category', severity: 'error' }));
      }
    } else {
      const result = await dispatch(
        createCategory({ categoryCode: form.categoryCode, name: form.name, description: form.description })
      );
      setSubmitting(false);
      if (createCategory.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'Category added', severity: 'success' }));
        dispatch(fetchCategories());
        onClose();
      } else {
        dispatch(showSnackbar({ message: 'Failed to add category', severity: 'error' }));
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {isEdit ? 'Edit category' : 'Add category'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Category code"
              placeholder="e.g. CAT-001"
              fullWidth
              value={form.categoryCode}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryCode: e.target.value }))}
              error={Boolean(errors.categoryCode)}
              helperText={errors.categoryCode}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Category name"
              placeholder="e.g. Power Outage"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              error={Boolean(errors.name)}
              helperText={errors.name}
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
