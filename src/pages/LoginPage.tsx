import { useState, type FormEvent } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, ConfirmationNumber } from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser, clearAuthError } from '../redux/slices/authSlice';
import type { FieldErrors } from '../utils/validators';
import { email as validateEmail, required } from '../utils/validators';
import { brand } from '../theme/palette';

type LoginField = 'email' | 'password';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useAppSelector((state) => state.auth);

  const [emailValue, setEmailValue] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});

  const validate = (): boolean => {
    const nextErrors: FieldErrors<LoginField> = {
      email: validateEmail(emailValue, 'Email'),
      password: required(password, 'Password'),
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    if (!validate()) return;
    const result = await dispatch(loginUser({ email: emailValue, password }));
    if (loginUser.fulfilled.match(result)) {
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    }
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
      <Paper elevation={4} sx={{ width: 760, maxWidth: '100%', borderRadius: 4, overflow: 'hidden' }}>
        <Grid container>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              p: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: { md: '1px dashed' },
              borderColor: { md: 'divider' },
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? `linear-gradient(160deg,${brand.indigo50},${brand.indigo100})`
                  : `linear-gradient(160deg,${brand.bgDark},${brand.surfaceDark})`,
            }}
          >
            <Box
              sx={{
                width: 140,
                height: 140,
                border: '1.5px dashed',
                borderColor: 'primary.main',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                bgcolor: 'background.paper',
              }}
            >
              <ConfirmationNumber sx={{ fontSize: 36 }} />
              <Typography variant="caption" sx={{ letterSpacing: '.15em', mt: 1 }}>
                TKT
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ p: 6 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '.12em' }}>
              Sign in
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, mb: 3, fontWeight: 700 }}>
              Ticketing System
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                label="Email"
                placeholder="Enter email"
                type="email"
                fullWidth
                margin="normal"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                autoFocus
              />
              <TextField
                label="Password"
                placeholder="Enter password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" tabIndex={-1}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
              </Button>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Typography
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot password?
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', p: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '.08em' }}>
            VERSION 2.4.1 · BUILD 20260627
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
