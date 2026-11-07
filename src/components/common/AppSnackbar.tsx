import { Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { hideSnackbar } from '../../redux/slices/uiSlice';

export default function AppSnackbar() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((state) => state.ui.snackbar);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3200}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={() => dispatch(hideSnackbar())} severity={severity} variant="filled" sx={{ fontWeight: 600 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
