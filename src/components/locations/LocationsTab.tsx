import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLocations } from '../../redux/slices/locationsSlice';

export default function LocationsTab() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.locations);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(fetchLocations({ page: page + 1, limit: rowsPerPage, searchText: search.trim() }));
    }, 300);
    return () => clearTimeout(handle);
  }, [dispatch, page, rowsPerPage, search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          placeholder="Search locations…"
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
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Location Name</TableCell>
              <TableCell>Associate</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>WAP Group</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& tr:nth-of-type(even)': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {items.map((loc) => (
              <TableRow key={loc.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{loc.name}</TableCell>
                <TableCell>{loc.associateName}</TableCell>
                <TableCell>{loc.remarks}</TableCell>
                <TableCell>{loc.wapGroupName}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && status !== 'loading' && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No locations match the current search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Box>
  );
}
