import { useState, type SyntheticEvent } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import RolesTab from '../components/roles/RolesTab';
import FeaturesTab from '../components/roles/FeaturesTab';

export default function RolesFeaturesPage() {
  const [tab, setTab] = useState(0);

  const handleChange = (_: SyntheticEvent, value: number) => setTab(value);

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleChange} sx={{ px: 2 }}>
            <Tab label="Roles" />
            <Tab label="Features" />
          </Tabs>
        </Box>
        {tab === 0 && <RolesTab />}
        {tab === 1 && <FeaturesTab />}
      </Paper>
    </Box>
  );
}
