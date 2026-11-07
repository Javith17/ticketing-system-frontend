import { useState, type SyntheticEvent } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import TicketsOverviewTab from '../components/reports/TicketsOverviewTab';
import TicketsHotspotTab from '../components/reports/TicketsHotspotTab';
import TicketsOverdueTab from '../components/reports/TicketsOverdueTab';
import ResolutionWorkloadTab from '../components/reports/ResolutionWorkloadTab';
import TicketNcrTimelineTab from '../components/reports/TicketNcrTimelineTab';
import NcrFunnelTab from '../components/reports/NcrFunnelTab';
import NcrAgingTab from '../components/reports/NcrAgingTab';
import NcrHotspotTab from '../components/reports/NcrHotspotTab';
import AlertBreachHistoryTab from '../components/reports/AlertBreachHistoryTab';
import TimeToNcrTab from '../components/reports/TimeToNcrTab';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (_: SyntheticEvent, value: number) => setActiveTab(value);

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" />
            <Tab label="Hotspot" />
            <Tab label="SLA / Overdue" />
            <Tab label="Resolution & Workload" />
            <Tab label="Ticket / NCR Timeline" />
            <Tab label="NCR Funnel" />
            <Tab label="NCR Aging" />
            <Tab label="NCR Hotspot" />
            <Tab label="Alert Breach History" />
            <Tab label="Time to NCR" />
          </Tabs>
        </Box>
        {activeTab === 0 && <TicketsOverviewTab />}
        {activeTab === 1 && <TicketsHotspotTab />}
        {activeTab === 2 && <TicketsOverdueTab />}
        {activeTab === 3 && <ResolutionWorkloadTab />}
        {activeTab === 4 && <TicketNcrTimelineTab />}
        {activeTab === 5 && <NcrFunnelTab />}
        {activeTab === 6 && <NcrAgingTab />}
        {activeTab === 7 && <NcrHotspotTab />}
        {activeTab === 8 && <AlertBreachHistoryTab />}
        {activeTab === 9 && <TimeToNcrTab />}
      </Paper>
    </Box>
  );
}
