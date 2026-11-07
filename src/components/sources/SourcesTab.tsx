import { useState } from 'react';
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSources } from '../../redux/slices/sourcesSlice';
import RefreshButton from '../common/RefreshButton';
import { useListLoader } from '../../hooks/useListLoader';
import type { Source } from '../../types';
import SourceFormDialog from './SourceFormDialog';

export default function SourcesTab() {
  const dispatch = useAppDispatch();
  const { items: sources } = useAppSelector((state) => state.sources);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchSources())], 'sources');

  const openCreate = () => {
    setEditSource(null);
    setDialogOpen(true);
  };
  const openEdit = (source: Source) => {
    setEditSource(source);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ flex: 1 }} />
        <RefreshButton onClick={refresh} loading={refreshing} />
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ ml: 1 }}>
          Add new source
        </Button>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Source name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sources.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{s.sourceName}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {s.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => openEdit(s)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sources.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No sources configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <SourceFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editSource={editSource} />
    </Box>
  );
}
