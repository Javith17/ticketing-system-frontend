import { useEffect, useState } from 'react';
import { Box, Button, Grid, TextField, Typography, Divider } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchEmailSettings, saveEmailSettings, testEmailSettings } from '../../redux/slices/emailSettingsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { email as emailValidator, required } from '../../utils/validators';
import RefreshButton from '../common/RefreshButton';
import { useListLoader } from '../../hooks/useListLoader';

export default function EmailSettingsTab() {
  const dispatch = useAppDispatch();
  const { settings, saveStatus, testStatus } = useAppSelector((s) => s.emailSettings);

  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const [testTo, setTestTo] = useState('');
  const [testToError, setTestToError] = useState<string | undefined>();

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchEmailSettings())], 'email settings');

  useEffect(() => {
    if (settings) setEmailId(settings.emailId);
  }, [settings]);

  const handleSave = async () => {
    const err = emailValidator(emailId, 'Email Id');
    setEmailError(err);
    if (err) return;
    const result = await dispatch(saveEmailSettings({ emailId, password }));
    if (saveEmailSettings.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Email settings saved', severity: 'success' }));
      setPassword('');
    } else {
      dispatch(showSnackbar({ message: 'Failed to save email settings', severity: 'error' }));
    }
  };

  const handleTestEmail = async () => {
    const err = required(testTo, 'Recipient email') || emailValidator(testTo, 'Recipient email');
    setTestToError(err);
    if (err) return;
    const result = await dispatch(testEmailSettings(testTo));
    if (testEmailSettings.fulfilled.match(result)) {
      const { success, message } = result.payload;
      dispatch(showSnackbar({ message: message || (success ? 'Test email sent' : 'Test email failed'), severity: success ? 'success' : 'error' }));
    } else {
      dispatch(showSnackbar({ message: 'Failed to send test email', severity: 'error' }));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 480 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Outgoing email configuration
        </Typography>
        <Box sx={{ flex: 1 }} />
        <RefreshButton onClick={refresh} loading={refreshing} />
      </Box>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label="Email Id"
            fullWidth
            value={emailId}
            onChange={(e) => {
              setEmailId(e.target.value);
              setEmailError(undefined);
            }}
            error={Boolean(emailError)}
            helperText={emailError}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Password"
            type="password"
            fullWidth
            placeholder={settings?.isConfigured ? 'Leave blank to keep unchanged' : ''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={settings?.isConfigured ? 'Leave blank to keep the current password' : undefined}
          />
        </Grid>
        <Grid size={12}>
          <Button variant="contained" onClick={handleSave} disabled={saveStatus === 'loading'}>
            Save
          </Button>
          {settings?.isConfigured && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Email is currently configured.
            </Typography>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Send a test email
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label="Recipient email"
            fullWidth
            value={testTo}
            onChange={(e) => {
              setTestTo(e.target.value);
              setTestToError(undefined);
            }}
            error={Boolean(testToError)}
            helperText={testToError}
          />
        </Grid>
        <Grid size={12}>
          <Button variant="outlined" onClick={handleTestEmail} disabled={testStatus === 'loading'}>
            Send Test
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
