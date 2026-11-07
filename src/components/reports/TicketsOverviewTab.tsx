import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTicketsOverview } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

export default function TicketsOverviewTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.overview);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    dispatch(fetchTicketsOverview({}));
  }, [dispatch]);

  const handleApply = () => {
    dispatch(fetchTicketsOverview({ from: from || undefined, to: to || undefined }));
  };

  const isEmpty = Boolean(data && data.byStatus.length === 0 && data.byPriority.length === 0 && data.bySource.length === 0);

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
          onClick={() => dispatch(showSnackbar({ message: 'Exporting tickets overview…', severity: 'info' }))}
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
        {status !== 'loading' && isEmpty && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No tickets found in the selected range.
          </Typography>
        )}
        {status !== 'loading' && data && !isEmpty && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                By status
              </Typography>
              <PieChart
                height={260}
                series={[{ data: data.byStatus.map((r, i) => ({ id: i, value: r.count, label: r.status })) }]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                By priority
              </Typography>
              <PieChart
                height={260}
                series={[{ data: data.byPriority.map((r, i) => ({ id: i, value: r.count, label: r.priority })) }]}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                By source
              </Typography>
              <BarChart
                height={280}
                series={[{ data: data.bySource.map((r) => r.count), label: 'Tickets' }]}
                xAxis={[{ data: data.bySource.map((r) => r.source), scaleType: 'band' }]}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Daily trend
              </Typography>
              <LineChart
                height={280}
                series={[{ data: data.trend.map((t) => t.count), label: 'Tickets created' }]}
                xAxis={[{ data: data.trend.map((t) => new Date(t.day).toLocaleDateString()), scaleType: 'point' }]}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
