import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchNcrFunnel } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

export default function NcrFunnelTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.ncrFunnel);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    dispatch(fetchNcrFunnel({}));
  }, [dispatch]);

  const handleApply = () => {
    dispatch(fetchNcrFunnel({ from: from || undefined, to: to || undefined }));
  };

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
          onClick={() => dispatch(showSnackbar({ message: 'Exporting NCR funnel…', severity: 'info' }))}
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
          <BarChart
            height={340}
            layout="horizontal"
            series={[{ data: data.map((r) => r.count), label: 'NCRs' }]}
            yAxis={[{ data: data.map((r) => r.status), scaleType: 'band' }]}
            margin={{ left: 180 }}
          />
        )}
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data ?? []).map((r) => (
              <TableRow key={r.status} hover>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
