import { useState } from 'react';
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchRoles } from '../../redux/slices/rolesSlice';
import RefreshButton from '../common/RefreshButton';
import { useListLoader } from '../../hooks/useListLoader';
import type { Role } from '../../types';
import RoleFormDialog, { type RoleDialogMode } from './RoleFormDialog';

export default function RolesTab() {
  const dispatch = useAppDispatch();
  const { items: roles } = useAppSelector((state) => state.roles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<RoleDialogMode>('create');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchRoles())], 'roles');

  const openCreate = () => {
    setSelectedRole(null);
    setDialogMode('create');
    setDialogOpen(true);
  };
  const openView = (role: Role) => {
    setSelectedRole(role);
    setDialogMode('view');
    setDialogOpen(true);
  };
  const openEdit = (role: Role) => {
    setSelectedRole(role);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ flex: 1 }} />
        <RefreshButton onClick={refresh} loading={refreshing} />
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ ml: 1 }}>
          Add New Role
        </Button>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Role code</TableCell>
              <TableCell>Role name</TableCell>
              <TableCell>Features</TableCell>
              <TableCell>View</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{r.roleCode}</TableCell>
                <TableCell>{r.roleName}</TableCell>
                <TableCell>
                  <Chip label={`${r.features.length} feature${r.features.length === 1 ? '' : 's'}`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => openView(r)}>
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => openEdit(r)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No roles configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <RoleFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} mode={dialogMode} role={selectedRole} />
    </Box>
  );
}
