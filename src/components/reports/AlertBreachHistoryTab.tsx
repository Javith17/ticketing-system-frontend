import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchAlertBreachHistory } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

const SCOPE_OPTIONS = ['All', 'Location', 'Section', 'Pole'] as const;
type ScopeOption = (typeof SCOPE_OPTIONS)[number];

export default function AlertBreachHistoryTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.alertBreachHistory);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [scope, setScope] = useState<ScopeOption>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    dispatch(
      fetchAlertBreachHistory({
        page: page + 1,
        limit: rowsPerPage,
        scope: scope === 'All' ? undefined : scope,
        from: from || undefined,
        to: to || undefined,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, rowsPerPage, scope]);

  const handleApply = () => {
    setPage(0);
    dispatch(
      fetchAlertBreachHistory({
        page: 1,
        limit: rowsPerPage,
        scope: scope === 'All' ? undefined : scope,
        from: from || undefined,
        to: to || undefined,
      }),
    );
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
        <TextField select size="small" label="Scope" value={scope} onChange={(e) => setScope(e.target.value as ScopeOption)} sx={{ minWidth: 140 }}>
          {SCOPE_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
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
          onClick={() => dispatch(showSnackbar({ message: 'Exporting alert breach history…', severity: 'info' }))}
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
              <Grid size={{ xs: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary">
                    Total breaches
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data.total}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary">
                    Unresolved
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data.unresolvedCount}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            {data.trend.length > 0 && (
              <LineChart
                height={220}
                series={[{ data: data.trend.map((t) => t.count), label: 'Breaches' }]}
                xAxis={[{ data: data.trend.map((t) => new Date(t.day).toLocaleDateString()), scaleType: 'point' }]}
              />
            )}
          </>
        )}
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Scope</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Window (days)</TableCell>
              <TableCell>Alert Date</TableCell>
              <TableCell>NCR Raised</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.list ?? []).map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.scope}</TableCell>
                <TableCell>{a.entity_name}</TableCell>
                <TableCell>{a.ticket_count}</TableCell>
                <TableCell>{a.window_days}</TableCell>
                <TableCell>{new Date(a.alert_date).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip size="small" label={a.ncr_ticket_id ? 'Yes' : 'No'} color={a.ncr_ticket_id ? 'success' : 'default'} />
                </TableCell>
              </TableRow>
            ))}
            {(data?.list ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No breaches in the selected range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={data?.total ?? 0}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Box>
  );
}
