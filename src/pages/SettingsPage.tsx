import { useState, type SyntheticEvent } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import EmailSettingsTab from '../components/settings/EmailSettingsTab';
import NcrThresholdTab from '../components/settings/NcrThresholdTab';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  const handleChange = (_: SyntheticEvent, value: number) => setTab(value);

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleChange} sx={{ px: 2 }}>
            <Tab label="Email Settings" />
            <Tab label="NCR Threshold" />
          </Tabs>
        </Box>
        {tab === 0 && <EmailSettingsTab />}
        {tab === 1 && <NcrThresholdTab />}
      </Paper>
    </Box>
  );
}
