import { useState, type FormEvent } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { ConfirmationNumber } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { requestPasswordReset, clearAuthError } from '../redux/slices/authSlice';
import { email as validateEmail } from '../utils/validators';

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { status, error, resetMessage } = useAppSelector((state) => state.auth);
  const [emailValue, setEmailValue] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const err = validateEmail(emailValue, 'Email ID');
    setFieldError(err);
    if (err) return;
    await dispatch(requestPasswordReset(emailValue));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={4} sx={{ width: 460, maxWidth: '100%', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 90,
                height: 90,
                border: '1.5px dashed',
                borderColor: 'primary.main',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <ConfirmationNumber sx={{ fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '.12em', display: 'block', textAlign: 'center' }}>
            Reset access
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, mb: 1, fontWeight: 700, textAlign: 'center' }}>
            Forgot your password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email and we'll send a reset link.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {resetMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resetMessage}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email ID"
              placeholder="you@company.gov.in"
              type="email"
              fullWidth
              margin="normal"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              error={Boolean(fieldError)}
              helperText={fieldError}
              autoFocus
            />
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={status === 'loading'}>
              {status === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Send reset link'}
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to sign in
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', p: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '.08em' }}>
            VERSION 2.4.1 · BUILD 20260627
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
