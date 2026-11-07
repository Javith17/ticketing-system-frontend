import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTimeToNcr } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

export default function TimeToNcrTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.timeToNcr);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    dispatch(fetchTimeToNcr({}));
  }, [dispatch]);

  const handleApply = () => {
    dispatch(fetchTimeToNcr({ from: from || undefined, to: to || undefined }));
  };

  const isEmpty = Boolean(data && data.sampleSize === 0);

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
          onClick={() => dispatch(showSnackbar({ message: 'Exporting time to NCR…', severity: 'info' }))}
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
            No breaches have resulted in an NCR yet in the selected range.
          </Typography>
        )}
        {status !== 'loading' && data && !isEmpty && (
          <>
            <Paper variant="outlined" sx={{ display: 'inline-block', px: 3, py: 2, mb: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Avg time to raise NCR
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {data.avgHoursToNcr?.toFixed(1)}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sample size: {data.sampleSize}
              </Typography>
            </Paper>
            <BarChart
              height={240}
              series={[{ data: data.byScope.map((s) => s.avgHours ?? 0), label: 'Avg hours' }]}
              xAxis={[{ data: data.byScope.map((s) => s.scope), scaleType: 'band' }]}
            />
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Scope</TableCell>
                  <TableCell>Avg Hours</TableCell>
                  <TableCell>Sample Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.byScope.map((s) => (
                  <TableRow key={s.scope} hover>
                    <TableCell>{s.scope}</TableCell>
                    <TableCell>{s.avgHours != null ? s.avgHours.toFixed(1) : '—'}</TableCell>
                    <TableCell>{s.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Box>
    </Box>
  );
}
