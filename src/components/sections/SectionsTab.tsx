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
import { fetchSections } from '../../redux/slices/sectionsSlice';

export default function SectionsTab() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.sections);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(fetchSections({ page: page + 1, limit: rowsPerPage, searchText: search.trim() }));
    }, 300);
    return () => clearTimeout(handle);
  }, [dispatch, page, rowsPerPage, search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          placeholder="Search sections…"
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
              <TableCell>Section Name</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Associate</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>WAP Group Id</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& tr:nth-of-type(even)': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {items.map((section) => (
              <TableRow key={section.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{section.name}</TableCell>
                <TableCell>{section.displayName}</TableCell>
                <TableCell>{section.locationName}</TableCell>
                <TableCell>{section.associateName}</TableCell>
                <TableCell>{section.remarks}</TableCell>
                <TableCell>{section.wapGroupId}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && status !== 'loading' && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No sections match the current search.
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
