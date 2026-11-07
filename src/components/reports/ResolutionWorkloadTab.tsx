import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
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
import { fetchResolutionWorkload, type ResolutionRow } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

const GROUP_OPTIONS = [
  { value: '', label: 'Overall' },
  { value: 'priority', label: 'Priority' },
  { value: 'source', label: 'Source' },
  { value: 'location', label: 'Location' },
] as const;

type GroupBy = '' | 'priority' | 'source' | 'location';

function toHours(seconds: number | null): number {
  return seconds == null ? 0 : seconds / 3600;
}

export default function ResolutionWorkloadTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.resolutionWorkload);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('');

  useEffect(() => {
    dispatch(fetchResolutionWorkload({ groupBy: groupBy || undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, groupBy]);

  const handleApply = () => {
    dispatch(fetchResolutionWorkload({ from: from || undefined, to: to || undefined, groupBy: groupBy || undefined }));
  };

  const rows: ResolutionRow[] = data
    ? Array.isArray(data.resolutionTime)
      ? data.resolutionTime
      : [data.resolutionTime]
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
        <TextField
          select
          size="small"
          label="Group by"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          sx={{ minWidth: 150 }}
        >
          {GROUP_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button size="small" variant="outlined" onClick={handleApply}>
          Apply
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          onClick={() => dispatch(showSnackbar({ message: 'Exporting resolution & workload…', severity: 'info' }))}
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
        {status !== 'loading' && rows.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No resolved tickets in the selected range.
          </Typography>
        )}
        {status !== 'loading' && rows.length > 0 && (
          <BarChart
            height={260}
            series={[{ data: rows.map((r) => toHours(r.avgSeconds)), label: 'Avg resolution hours' }]}
            xAxis={[{ data: rows.map((r) => r.groupKey ?? 'Overall'), scaleType: 'band' }]}
          />
        )}
      </Box>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Open tickets by technician
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Technician</TableCell>
                <TableCell>Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.openByTechnician ?? []).map((w) => (
                <TableRow key={w.userId} hover>
                  <TableCell>{w.userName ?? w.userId}</TableCell>
                  <TableCell>{w.count}</TableCell>
                </TableRow>
              ))}
              {(data?.openByTechnician ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                    No open tickets assigned.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Open tickets by RSM
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>RSM</TableCell>
                <TableCell>Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.openByRsm ?? []).map((w) => (
                <TableRow key={w.userId} hover>
                  <TableCell>{w.userName ?? w.userId}</TableCell>
                  <TableCell>{w.count}</TableCell>
                </TableRow>
              ))}
              {(data?.openByRsm ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                    No open tickets assigned.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Box>
  );
}
