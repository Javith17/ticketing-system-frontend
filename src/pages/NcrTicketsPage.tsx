import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchNcrTickets } from '../redux/slices/ncrSlice';
import { showSnackbar } from '../redux/slices/uiSlice';
import type { NcrStatus, NcrTicket } from '../types';
import NcrStatusChip from '../components/ncr/NcrStatusChip';
import NcrDetailDialog from '../components/ncr/NcrDetailDialog';
import RaiseNcrDialog from '../components/ncr/RaiseNcrDialog';
import NcrAlertsBell from '../components/ncr/NcrAlertsBell';
import RefreshButton from '../components/common/RefreshButton';
import { useListLoader } from '../hooks/useListLoader';
import { useRoleCode } from '../hooks/useRoleCode';

// 'Awaiting Stores' is a client-side filter for the Stores role's queue:
// NCRs waiting for material issue or for a returned-item disposition.
type StatusFilter = NcrStatus | 'All' | 'Awaiting Stores';
const STORES_QUEUE: NcrStatus[] = ['Material_request_approved', 'Item_returned'];

const statusOptions: StatusFilter[] = [
  'All',
  'Awaiting Stores',
  'In-Review',
  'Approved',
  'Rejected',
  'Material_request_Initiated',
  'Material_request_approved',
  'Material_issued',
  'Material_received',
  'Item_returned',
  'Return_dispositioned',
  'Technician Closed',
  'PM Closed',
  'Closed',
];

export default function NcrTicketsPage() {
  const dispatch = useAppDispatch();
  const { items: ncrTickets, detail: ncrDetail } = useAppSelector((state) => state.ncr);
  const [search, setSearch] = useState('');
  const roleCode = useRoleCode();
  const [ticketStatus, setTicketStatus] = useState<StatusFilter>('All');
  const [storesDefaultApplied, setStoresDefaultApplied] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const isAdmin = roleCode === 'ADMIN';

  // Stores users land on their own queue by default.
  useEffect(() => {
    if (roleCode === 'STORES' && !storesDefaultApplied) {
      setTicketStatus('Awaiting Stores');
      setStoresDefaultApplied(true);
    }
  }, [roleCode, storesDefaultApplied]);

  // Loads on open, again whenever the status filter changes, and on refresh.
  const { refresh, refreshing } = useListLoader(
    () => [dispatch(fetchNcrTickets(ticketStatus === 'Awaiting Stores' ? 'All' : ticketStatus))],
    'NCR tickets',
    ticketStatus,
  );

  const filtered = useMemo(() => {
    return ncrTickets.filter((n) => {
      if (ticketStatus === 'Awaiting Stores' && !STORES_QUEUE.includes(n.status)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!n.ticketNo.toLowerCase().includes(q) && !n.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [ncrTickets, search, ticketStatus]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const selected: NcrTicket | null = selectedId
    ? ncrTickets.find((n) => n.id === selectedId) ?? (ncrDetail?.id === selectedId ? ncrDetail : null)
    : null;

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            NCR Tickets
          </Typography>
          <Box sx={{ flex: 1 }} />
          <NcrAlertsBell onViewNcr={(id) => setSelectedId(id)} />
          <RefreshButton onClick={refresh} loading={refreshing} />
          {isAdmin && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setRaiseOpen(true)}
              sx={{ mx: 1 }}
            >
              Raise NCR
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => dispatch(showSnackbar({ message: 'Exporting NCR tickets…', severity: 'info' }))}
          >
            Export
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
          <TextField
            size="small"
            placeholder="Search NCR tickets…"
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
            value={ticketStatus}
            onChange={(e) => {
              setTicketStatus(e.target.value as StatusFilter);
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          >
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s === 'All' ? 'Status: All' : s}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticket No</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Linked tickets</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((n) => (
                <TableRow key={n.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{n.ticketNo}</TableCell>
                  <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.description}
                  </TableCell>
                  <TableCell>{n.linkedTickets.map((t) => t.ticketNo).join(', ') || '-'}</TableCell>
                  <TableCell>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <NcrStatusChip status={n.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => setSelectedId(n.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No NCR tickets match the current filters.
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
      </Paper>

      <NcrDetailDialog open={Boolean(selectedId)} onClose={() => setSelectedId(null)} ticket={selected} />
      {isAdmin && <RaiseNcrDialog open={raiseOpen} onClose={() => setRaiseOpen(false)} />}
    </Box>
  );
}
