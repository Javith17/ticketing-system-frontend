import { useState } from 'react';
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchFeatures } from '../../redux/slices/featuresSlice';
import RefreshButton from '../common/RefreshButton';
import { useListLoader } from '../../hooks/useListLoader';
import type { Feature } from '../../types';
import FeatureFormDialog from './FeatureFormDialog';

export default function FeaturesTab() {
  const dispatch = useAppDispatch();
  const { items: features } = useAppSelector((state) => state.features);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFeature, setEditFeature] = useState<Feature | null>(null);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchFeatures())], 'features');

  const openCreate = () => {
    setEditFeature(null);
    setDialogOpen(true);
  };
  const openEdit = (feature: Feature) => {
    setEditFeature(feature);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ flex: 1 }} />
        <RefreshButton onClick={refresh} loading={refreshing} />
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ ml: 1 }}>
          Add new feature
        </Button>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Feature name</TableCell>
              <TableCell>Requires approval</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((f) => (
              <TableRow key={f.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{f.feature}</TableCell>
                <TableCell>
                  {f.isApproval ? (
                    <Chip label="Yes" color="success" size="small" variant="outlined" />
                  ) : (
                    <Chip label="No" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => openEdit(f)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {features.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No features configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <FeatureFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editFeature={editFeature} />
    </Box>
  );
}
