import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Designation, User } from '../../types';
import {
  required,
  employeeCode as validateEmployeeCode,
  email as validateEmail,
  hasErrors,
  type FieldErrors,
} from '../../utils/validators';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createUser, updateUser } from '../../redux/slices/usersSlice';
import { fetchRoles } from '../../redux/slices/rolesSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

const designations: Designation[] = ['JE', 'AE', 'ADE', 'DE', 'SE', 'CE'];

type UserField = 'firstName' | 'lastName' | 'employeeCode' | 'designation' | 'email' | 'roleId';

interface FormState {
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: Designation | '';
  email: string;
  roleId: string;
}

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  employeeCode: '',
  designation: '',
  email: '',
  roleId: '',
};

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  editUser?: User | null;
}

export default function UserFormDialog({ open, onClose, editUser }: UserFormDialogProps) {
  const dispatch = useAppDispatch();
  const { items: roles, status: rolesStatus } = useAppSelector((state) => state.roles);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<UserField>>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editUser);

  useEffect(() => {
    if (open) {
      if (rolesStatus !== 'succeeded' && rolesStatus !== 'loading') dispatch(fetchRoles());
      setForm(
        editUser
          ? {
              firstName: editUser.firstName,
              lastName: editUser.lastName,
              employeeCode: editUser.employeeCode,
              designation: editUser.designation,
              email: editUser.email,
              roleId: editUser.roleId,
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, editUser, rolesStatus, dispatch]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors<UserField> = {
      firstName: required(form.firstName, 'First name'),
      lastName: required(form.lastName, 'Last name'),
      employeeCode: validateEmployeeCode(form.employeeCode),
      designation: required(form.designation, 'Designation'),
      email: validateEmail(form.email, 'Email'),
      roleId: required(form.roleId, 'Role'),
    };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    if (isEdit && editUser) {
      const result = await dispatch(
        updateUser({
          ...editUser,
          firstName: form.firstName,
          lastName: form.lastName,
          designation: form.designation,
          email: form.email,
          roleId: form.roleId,
        })
      );
      setSubmitting(false);
      if (updateUser.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'User updated', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to update user', severity: 'error' }));
      }
    } else {
      const result = await dispatch(
        createUser({
          firstName: form.firstName,
          lastName: form.lastName,
          employeeCode: form.employeeCode,
          designation: form.designation,
          email: form.email,
          roleId: form.roleId,
        })
      );
      setSubmitting(false);
      if (createUser.fulfilled.match(result)) {
        dispatch(showSnackbar({ message: 'User added — default password is the employee code', severity: 'success' }));
        onClose();
      } else {
        dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to add user', severity: 'error' }));
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {isEdit ? 'Edit user' : 'Add new user'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First name"
              placeholder="First name"
              fullWidth
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last name"
              placeholder="Last name"
              fullWidth
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Employee code"
              placeholder="EMP-0000"
              fullWidth
              value={form.employeeCode}
              onChange={(e) => setField('employeeCode', e.target.value)}
              error={Boolean(errors.employeeCode)}
              helperText={errors.employeeCode || (isEdit ? undefined : 'Also becomes the default password')}
              disabled={isEdit}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Designation"
              fullWidth
              value={form.designation}
              onChange={(e) => setField('designation', e.target.value as Designation)}
              error={Boolean(errors.designation)}
              helperText={errors.designation}
            >
              {designations.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Email"
              placeholder="name@company.com"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              select
              label="Role"
              fullWidth
              value={form.roleId}
              onChange={(e) => setField('roleId', e.target.value)}
              error={Boolean(errors.roleId)}
              helperText={errors.roleId}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.roleName}
                </MenuItem>
              ))}
            </TextField>
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
