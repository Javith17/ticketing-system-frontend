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
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTicketsOverdue } from '../../redux/slices/reportsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { formatDateTime24 } from '../../utils/format';

function daysOverdue(dueAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dueAt).getTime()) / 86400000));
}

export default function TicketsOverdueTab() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((state) => state.reports.overdue);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    dispatch(fetchTicketsOverdue({ page: page + 1, limit: rowsPerPage, from: from || undefined, to: to || undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, rowsPerPage]);

  const handleApply = () => {
    setPage(0);
    dispatch(fetchTicketsOverdue({ page: 1, limit: rowsPerPage, from: from || undefined, to: to || undefined }));
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
          onClick={() => dispatch(showSnackbar({ message: 'Exporting overdue tickets…', severity: 'info' }))}
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
        {status !== 'loading' && data && data.count === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No overdue tickets in the selected range.
          </Typography>
        )}
        {status !== 'loading' && data && data.count > 0 && (
          <>
            <Paper variant="outlined" sx={{ display: 'inline-block', px: 3, py: 2, mb: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Overdue tickets
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {data.count}
              </Typography>
            </Paper>
            {data.trend.length > 0 && (
              <LineChart
                height={220}
                series={[{ data: data.trend.map((t) => t.count), label: 'Overdue by due date' }]}
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
              <TableCell>Ticket Id</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Pole</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due At</TableCell>
              <TableCell>Days Overdue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.list ?? []).map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{t.ticket_id}</TableCell>
                <TableCell>{t.issue}</TableCell>
                <TableCell>{t.location_name}</TableCell>
                <TableCell>{t.section_name}</TableCell>
                <TableCell>{t.pole_name}</TableCell>
                <TableCell>{t.priority}</TableCell>
                <TableCell>{formatDateTime24(t.due_at)}</TableCell>
                <TableCell>{daysOverdue(t.due_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={data?.count ?? 0}
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
