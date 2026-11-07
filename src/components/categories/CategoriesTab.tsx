import { useState } from 'react';
import { Box, Button, Grid, Card, CardActionArea, Avatar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCategories } from '../../redux/slices/categoriesSlice';
import RefreshButton from '../common/RefreshButton';
import { useListLoader } from '../../hooks/useListLoader';
import type { Category } from '../../types';
import CategoryFormDialog from './CategoryFormDialog';

export default function CategoriesTab() {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((state) => state.categories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchCategories())], 'categories');

  const openCreate = () => {
    setEditCategory(null);
    setDialogOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditCategory(category);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ flex: 1 }} />
        <RefreshButton onClick={refresh} loading={refreshing} />
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ ml: 1 }}>
          Add category
        </Button>
      </Box>
      <Box sx={{ p: 2.5, pt: 0 }}>
        <Grid container spacing={2}>
          {categories.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card variant="outlined">
                <CardActionArea onClick={() => openEdit(c)} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}>
                    <CategoryIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                      {c.categoryCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.ticketCount} tickets
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          {categories.length === 0 && (
            <Grid size={12}>
              <Typography align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No categories configured yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <CategoryFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editCategory={editCategory} />
    </Box>
  );
}
