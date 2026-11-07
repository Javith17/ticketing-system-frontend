import { useState, type SyntheticEvent } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import LocationsTab from '../components/locations/LocationsTab';
import SectionsTab from '../components/sections/SectionsTab';
import PolesTab from '../components/poles/PolesTab';

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (_: SyntheticEvent, value: number) => setActiveTab(value);

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab label="Locations" />
            <Tab label="Sections" />
            <Tab label="Poles" />
          </Tabs>
        </Box>
        {activeTab === 0 && <LocationsTab />}
        {activeTab === 1 && <SectionsTab />}
        {activeTab === 2 && <PolesTab />}
      </Paper>
    </Box>
  );
}
