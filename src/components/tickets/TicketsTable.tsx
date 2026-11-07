import { useMemo, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import type { Ticket, TicketStatus, Severity } from '../../types';
import SeverityChip from '../common/SeverityChip';
import StatusChip from '../common/StatusChip';
import { formatDateTime24 } from '../../utils/format';
import { useAppDispatch } from '../../redux/hooks';
import { showSnackbar } from '../../redux/slices/uiSlice';

const statusOptions: (TicketStatus | 'All')[] = [
  'All',
  'Open',
  'In Progress',
  'Closed',
  'Under Review',
  'Assigned RSM',
  'Assigned Technician',
  'Started',
  'Closure Approval',
  'Ticket Closed',
];
const severityOptions: (Severity | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];

interface TicketsTableProps {
  tickets: Ticket[];
  onView: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onTimeline: (ticket: Ticket) => void;
}

export default function TicketsTable({ tickets, onView, onEdit, onTimeline }: TicketsTableProps) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'All'>('All');
  const [severity, setSeverity] = useState<Severity | 'All'>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (status !== 'All' && t.status !== status) return false;
      if (severity !== 'All' && t.severity !== severity) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !t.complaintId.toLowerCase().includes(q) &&
          !t.title.toLowerCase().includes(q) &&
          !t.assignedUser.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, search, status, severity]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 220, flex: 1, maxWidth: 340 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TicketStatus | 'All');
            setPage(0);
          }}
          sx={{ minWidth: 140 }}
        >
          {statusOptions.map((s) => (
            <MenuItem key={s} value={s}>
              {s === 'All' ? 'Status: All' : s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Priority"
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value as Severity | 'All');
            setPage(0);
          }}
          sx={{ minWidth: 140 }}
        >
          {severityOptions.map((s) => (
            <MenuItem key={s} value={s}>
              {s === 'All' ? 'Priority: All' : s}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          size="small"
          onClick={() => dispatch(showSnackbar({ message: 'Filters applied', severity: 'info' }))}
        >
          Apply
        </Button>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ticket Id</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created at</TableCell>
              <TableCell>Pole</TableCell>
              <TableCell>User</TableCell>
              <TableCell>View</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{t.complaintId}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.source}</TableCell>
                <TableCell>
                  <StatusChip status={t.status} />
                </TableCell>
                <TableCell>
                  <SeverityChip severity={t.severity} />
                </TableCell>
                <TableCell>{formatDateTime24(t.createdAt)}</TableCell>
                <TableCell>{t.poleName ?? t.asset}</TableCell>
                <TableCell>{t.assignedUser}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => onView(t)}>
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  <Tooltip title="Timeline">
                    <IconButton size="small" onClick={() => onTimeline(t)}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {t.status === 'Under Review' && (
                    <Tooltip title="Edit ticket">
                      <IconButton size="small" onClick={() => onEdit(t)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No tickets match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={filtered.length}
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
