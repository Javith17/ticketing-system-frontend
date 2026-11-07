import { useState } from 'react';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Ticket } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchTickets } from '../redux/slices/ticketsSlice';
import TrendSparkline from '../components/common/TrendSparkline';
import TicketsTable from '../components/tickets/TicketsTable';
import TicketFormDialog from '../components/tickets/TicketFormDialog';
import TicketEditDialog from '../components/tickets/TicketEditDialog';
import TicketTimelineDrawer from '../components/tickets/TicketTimelineDrawer';
import RefreshButton from '../components/common/RefreshButton';
import { useListLoader } from '../hooks/useListLoader';

const trendPoints = [18, 32, 24, 40, 30, 52, 44];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: tickets } = useAppSelector((state) => state.tickets);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [dataEditTicket, setDataEditTicket] = useState<Ticket | null>(null);
  const [timelineTicket, setTimelineTicket] = useState<Ticket | null>(null);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchTickets())], 'tickets');

  const criticalToday = tickets.filter((t) => t.severity === 'Critical').length;
  const openTotal = tickets.filter((t) => t.status !== 'Closed').length;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5 }} variant="outlined">
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'error.main' }}>
              {criticalToday}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
              Total critical tickets today
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ▲ 3 vs yesterday
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5 }} variant="outlined">
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>
              {openTotal}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
              Total tickets open as of today
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ▼ 12 vs yesterday
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5 }} variant="outlined">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
              Trend — this week
            </Typography>
            <TrendSparkline points={trendPoints} />
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Tickets
          </Typography>
          <Box sx={{ flex: 1 }} />
          <RefreshButton onClick={refresh} loading={refreshing} />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ ml: 1 }}
          >
            Create new ticket
          </Button>
        </Box>
        <TicketsTable tickets={tickets} onView={setEditTicket} onEdit={setDataEditTicket} onTimeline={setTimelineTicket} />
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
