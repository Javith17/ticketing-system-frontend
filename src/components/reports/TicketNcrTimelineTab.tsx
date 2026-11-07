import { useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTimeline } from '../../redux/slices/reportsSlice';

const NCR_SOURCES = new Set(['ncr', 'ncr_review', 'ncr_approval', 'ncr_closure']);

export default function TicketNcrTimelineTab() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((state) => state.reports.timeline);
  const [code, setCode] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!code.trim()) return;
    setSearched(true);
    dispatch(fetchTimeline(code.trim()));
  };

  const ticket = data?.ticket;
  const ncr = data?.ncr;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          placeholder="Ticket or NCR number (e.g. TCK-000018 or NCR_000003)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          sx={{ minWidth: 320 }}
        />
        <Button size="small" variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      <Box sx={{ p: 2 }}>
        {!searched && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Enter a ticket or NCR number to view its full timeline.
          </Typography>
        )}
        {searched && status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {searched && status === 'failed' && <Alert severity="error">{error ?? `No ticket or NCR found for '${code}'.`}</Alert>}
        {searched && status === 'succeeded' && data && (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {ticket && (
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Ticket
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {String(ticket.ticket_id)} — {String(ticket.issue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {String(ticket.status)} · {String(ticket.priority)} ·{' '}
                    {[ticket.location_name, ticket.section_name, ticket.pole_name].filter(Boolean).join(' / ') ||
                      'No location'}
                  </Typography>
                </Box>
              )}
              {ncr && (
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    NCR
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{String(ncr.ticket_id)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {String(ncr.status)}
                  </Typography>
                </Box>
              )}
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.timeline.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    pb: 1.5,
                    borderBottom: index < data.timeline.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Chip
                    size="small"
                    label={NCR_SOURCES.has(event.source) ? 'NCR' : 'Ticket'}
                    color={NCR_SOURCES.has(event.source) ? 'secondary' : 'primary'}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.label}
                    </Typography>
                    {event.remarks && (
                      <Typography variant="body2" color="text.secondary">
                        {event.remarks}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.at).toLocaleString()}
                      {event.actor ? ` · ${event.actor}` : ''}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
