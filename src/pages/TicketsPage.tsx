import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import type { Ticket } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchTickets } from '../redux/slices/ticketsSlice';
import { showSnackbar } from '../redux/slices/uiSlice';
import TicketsTable from '../components/tickets/TicketsTable';
import TicketFormDialog from '../components/tickets/TicketFormDialog';
import TicketEditDialog from '../components/tickets/TicketEditDialog';
import TicketTimelineDrawer from '../components/tickets/TicketTimelineDrawer';
import RefreshButton from '../components/common/RefreshButton';
import { useListLoader } from '../hooks/useListLoader';

const SCOPE_FIELD: Record<string, keyof Ticket> = {
  Location: 'locationId',
  Section: 'sectionId',
  Pole: 'poleId',
};

export default function TicketsPage() {
  const dispatch = useAppDispatch();
  const { items: tickets } = useAppSelector((state) => state.tickets);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [dataEditTicket, setDataEditTicket] = useState<Ticket | null>(null);
  const [timelineTicket, setTimelineTicket] = useState<Ticket | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchTickets())], 'tickets');

  const scope = searchParams.get('scope');
  const entityIdParam = searchParams.get('entityId');
  const entityName = searchParams.get('name');
  const entityId = entityIdParam != null ? Number(entityIdParam) : null;
  const scopeField = scope ? SCOPE_FIELD[scope] : undefined;

  const scopedTickets = useMemo(() => {
    if (!scopeField || entityId == null) return tickets;
    return tickets.filter((t) => t[scopeField] === entityId);
  }, [tickets, scopeField, entityId]);

  const clearFilter = () => setSearchParams({});

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            All tickets
          </Typography>
          {scope && entityName && (
            <Chip label={`${scope}: ${entityName}`} onDelete={clearFilter} size="small" sx={{ ml: 1 }} />
          )}
          <Box sx={{ flex: 1 }} />
          <RefreshButton onClick={refresh} loading={refreshing} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => dispatch(showSnackbar({ message: 'Exporting tickets…', severity: 'info' }))}
          >
            Export
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create new ticket
          </Button>
        </Box>
        <TicketsTable
          tickets={scopedTickets}
          onView={setEditTicket}
          onEdit={setDataEditTicket}
          onTimeline={setTimelineTicket}
        />
      </Paper>

      <TicketFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <TicketFormDialog open={Boolean(dataEditTicket)} onClose={() => setDataEditTicket(null)} ticket={dataEditTicket} />
      <TicketEditDialog open={Boolean(editTicket)} onClose={() => setEditTicket(null)} ticket={editTicket} />
      <TicketTimelineDrawer
        open={Boolean(timelineTicket)}
        onClose={() => setTimelineTicket(null)}
        ticketId={timelineTicket?.id ?? null}
        ticketLabel={timelineTicket?.complaintId}
      />
    </Box>
  );
}
