import { useState, type SyntheticEvent } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import CategoriesTab from '../components/categories/CategoriesTab';
import SourcesTab from '../components/sources/SourcesTab';

export default function CategoriesSourcesPage() {
  const [tab, setTab] = useState(0);

  const handleChange = (_: SyntheticEvent, value: number) => setTab(value);

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleChange} sx={{ px: 2 }}>
            <Tab label="Categories" />
            <Tab label="Sources" />
          </Tabs>
        </Box>
        {tab === 0 && <CategoriesTab />}
        {tab === 1 && <SourcesTab />}
      </Paper>
    </Box>
  );
}
