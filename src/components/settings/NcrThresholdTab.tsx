import { useEffect, useState } from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchNcrThresholds, saveNcrThresholds, type NcrThresholdScope } from '../../redux/slices/ncrThresholdSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import RefreshButton from '../common/RefreshButton';
import { useListLoader } from '../../hooks/useListLoader';

const SCOPES: { scope: NcrThresholdScope; label: string }[] = [
  { scope: 'Location', label: 'Per Location' },
  { scope: 'Section', label: 'Per Section' },
  { scope: 'Pole', label: 'Per Pole' },
];

type FormRow = { maxTickets: string; windowDays: string };
type FormState = Record<NcrThresholdScope, FormRow>;

const emptyForm: FormState = {
  Location: { maxTickets: '', windowDays: '' },
  Section: { maxTickets: '', windowDays: '' },
  Pole: { maxTickets: '', windowDays: '' },
};

export default function NcrThresholdTab() {
  const dispatch = useAppDispatch();
  const { items, saveStatus } = useAppSelector((s) => s.ncrThreshold);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchNcrThresholds())], 'NCR thresholds');

  useEffect(() => {
    if (items.length === 0) return;
    setForm((prev) => {
      const next = { ...prev };
      for (const item of items) {
        next[item.scope] = {
          maxTickets: item.maxTickets != null ? String(item.maxTickets) : '',
          windowDays: item.windowDays != null ? String(item.windowDays) : '',
        };
      }
      return next;
    });
  }, [items]);

  const setField = (scope: NcrThresholdScope, field: keyof FormRow, value: string) => {
    setForm((prev) => ({ ...prev, [scope]: { ...prev[scope], [field]: value } }));
  };

  const handleSave = async () => {
    const thresholds = SCOPES.map(({ scope }) => ({
      scope,
      maxTickets: Number(form[scope].maxTickets),
      windowDays: Number(form[scope].windowDays),
    }));

    const invalid = thresholds.some(
      (t) => !Number.isInteger(t.maxTickets) || t.maxTickets < 1 || !Number.isInteger(t.windowDays) || t.windowDays < 1,
    );
    if (invalid) {
      dispatch(showSnackbar({ message: 'Enter a positive whole number for every max tickets / window days field', severity: 'error' }));
      return;
    }

    const result = await dispatch(saveNcrThresholds(thresholds));
    if (saveNcrThresholds.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'NCR thresholds saved', severity: 'success' }));
    } else {
      dispatch(showSnackbar({ message: 'Failed to save NCR thresholds', severity: 'error' }));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 560 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          NCR alert thresholds
        </Typography>
        <Box sx={{ flex: 1 }} />
        <RefreshButton onClick={refresh} loading={refreshing} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        When the number of tickets created for a Location, Section, or Pole reaches or exceeds the configured max within
        the configured day window, an alert email is sent and it's logged in the NCR tickets bell.
      </Typography>
      <Grid container spacing={2}>
        {SCOPES.map(({ scope, label }) => (
          <Grid size={12} key={scope}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {label}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Max tickets"
                  type="number"
                  fullWidth
                  size="small"
                  value={form[scope].maxTickets}
                  onChange={(e) => setField(scope, 'maxTickets', e.target.value)}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Window (days)"
                  type="number"
                  fullWidth
                  size="small"
                  value={form[scope].windowDays}
                  onChange={(e) => setField(scope, 'windowDays', e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid size={12}>
          <Button variant="contained" onClick={handleSave} disabled={saveStatus === 'loading'}>
            Save
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
