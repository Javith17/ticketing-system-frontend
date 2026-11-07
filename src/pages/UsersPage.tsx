import { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createUser, fetchUsers, sendTestNotification } from '../redux/slices/usersSlice';
import { fetchRoles } from '../redux/slices/rolesSlice';
import { showSnackbar } from '../redux/slices/uiSlice';
import type { Designation, User } from '../types';
import UserFormDialog from '../components/users/UserFormDialog';
import CsvImportButtons from '../components/common/CsvImportButtons';
import RefreshButton from '../components/common/RefreshButton';
import { useListLoader } from '../hooks/useListLoader';
import { employeeCode as validateEmployeeCode, isValidEmail } from '../utils/validators';

const designations: (Designation | 'All')[] = ['All', 'JE', 'AE', 'ADE', 'DE', 'SE', 'CE'];
const validDesignations: Designation[] = ['JE', 'AE', 'ADE', 'DE', 'SE', 'CE'];

const USER_CSV_HEADERS = ['first_name', 'last_name', 'employee_code', 'designation', 'role', 'email_id'];
const USER_CSV_SAMPLE_ROW = ['Ravi', 'Kumar', 'EMP-1001', 'JE', 'Junior Engineer', 'ravi.kumar@ticketing.gov.in'];

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { items: users } = useAppSelector((state) => state.users);
  const { items: roles, status: rolesStatus } = useAppSelector((state) => state.roles);
  const [search, setSearch] = useState('');
  const [designation, setDesignation] = useState<Designation | 'All'>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const { refresh, refreshing } = useListLoader(() => [dispatch(fetchUsers()), dispatch(fetchRoles())], 'users');

  const roleName = (roleId: string) => roles.find((r) => r.id === roleId)?.roleName ?? '—';

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (designation !== 'All' && u.designation !== designation) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !u.firstName.toLowerCase().includes(q) &&
          !u.lastName.toLowerCase().includes(q) &&
          !u.employeeCode.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [users, search, designation]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openCreate = () => {
    setEditUser(null);
    setDialogOpen(true);
  };
  const openEdit = (user: User) => {
    setEditUser(user);
    setDialogOpen(true);
  };

  const handleSendTestNotification = async (user: User) => {
    setNotifyingId(user.id);
    const result = await dispatch(sendTestNotification(user.id));
    setNotifyingId(null);
    if (sendTestNotification.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: result.payload.message, severity: 'success' }));
    } else {
      dispatch(showSnackbar({ message: result.error?.message ?? 'Failed to send test notification', severity: 'error' }));
    }
  };

  const handleImportRows = async (rows: Record<string, string>[]) => {
    let currentRoles = roles;
    if (rolesStatus !== 'succeeded') {
      const rolesResult = await dispatch(fetchRoles());
      if (fetchRoles.fulfilled.match(rolesResult)) currentRoles = rolesResult.payload;
    }

    let success = 0;
    let failed = 0;
    for (const row of rows) {
      const firstName = row['first_name'];
      const lastName = row['last_name'];
      const employeeCodeValue = row['employee_code'];
      const designationValue = row['designation']?.toUpperCase() as Designation;
      const roleNameValue = row['role'];
      const emailValue = row['email_id'];
      const matchedRole = currentRoles.find((r) => r.roleName.toLowerCase() === roleNameValue?.toLowerCase());

      if (
        !firstName ||
        !lastName ||
        !validDesignations.includes(designationValue) ||
        !emailValue ||
        !isValidEmail(emailValue) ||
        !employeeCodeValue ||
        validateEmployeeCode(employeeCodeValue) ||
        !matchedRole
      ) {
        failed++;
        continue;
      }

      const result = await dispatch(
        createUser({
          firstName,
          lastName,
          employeeCode: employeeCodeValue,
          designation: designationValue,
          email: emailValue,
          roleId: matchedRole.id,
        })
      );
      if (createUser.fulfilled.match(result)) success++;
      else failed++;
    }
    dispatch(fetchUsers());
    return { success, failed };
  };

  return (
    <Box>
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1.5px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Users
          </Typography>
          <Box sx={{ flex: 1 }} />
          <RefreshButton onClick={refresh} loading={refreshing} />
          <CsvImportButtons
            sampleFilename="users-sample.csv"
            sampleHeaders={USER_CSV_HEADERS}
            sampleRow={USER_CSV_SAMPLE_ROW}
            entityLabelPlural="users"
            onImport={handleImportRows}
          />
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
            Add new user
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
          <TextField
            size="small"
            placeholder="Search users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 220, flex: 1, maxWidth: 340 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            label="Designation"
            value={designation}
            onChange={(e) => {
              setDesignation(e.target.value as Designation | 'All');
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            {designations.map((d) => (
              <MenuItem key={d} value={d}>
                {d === 'All' ? 'Designation: All' : d}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>First name</TableCell>
                <TableCell>Last name</TableCell>
                <TableCell>Employee code</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.firstName}</TableCell>
                  <TableCell>{u.lastName}</TableCell>
                  <TableCell>{u.employeeCode}</TableCell>
                  <TableCell>{u.designation}</TableCell>
                  <TableCell>{roleName(u.roleId)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Button size="small" variant="outlined" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Tooltip title="Send test notification">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={notifyingId === u.id}
                            onClick={() => handleSendTestNotification(u)}
                          >
                            {notifyingId === u.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <NotificationsActiveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No users match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <UserFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editUser={editUser} />
    </Box>
  );
}
