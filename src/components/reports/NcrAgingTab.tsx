import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchNcrAging } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

function formatHours(hours: number | null): string {
  if (hours == null) return '—';
  return `${hours.toFixed(1)}h`;
}

export default function NcrAgingTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.ncrAging);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    dispatch(fetchNcrAging({}));
  }, [dispatch]);

  const handleApply = () => {
    dispatch(fetchNcrAging({ from: from || undefined, to: to || undefined }));
  };

  const stages = data
    ? [
        { label: 'Raised → Reviewed', hours: data.avgRaisedToReviewedHours },
        { label: 'Reviewed → Approved', hours: data.avgReviewedToApprovedHours },
        { label: 'Approved → Closed', hours: data.avgApprovedToClosedHours },
        { label: 'Total cycle', hours: data.avgTotalCycleHours },
      ]
    : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button size="small" variant="outlined" onClick={handleApply}>
          Apply
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          onClick={() => dispatch(showSnackbar({ message: 'Exporting NCR aging…', severity: 'info' }))}
        >
          Export
        </Button>
      </Box>
      <Box sx={{ p: 2 }}>
        {status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {status !== 'loading' && data && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {stages.map((s) => (
                <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="overline" color="text.secondary">
                      {s.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatHours(s.hours)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <BarChart
              height={260}
              series={[{ data: stages.map((s) => s.hours ?? 0), label: 'Avg hours' }]}
              xAxis={[{ data: stages.map((s) => s.label), scaleType: 'band' }]}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sample size: {data.sampleSize} NCRs
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
