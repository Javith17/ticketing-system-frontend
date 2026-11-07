import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchPoles } from '../../redux/slices/polesSlice';
import type { Pole } from '../../types';
import PoleBarcodeDialog from './PoleBarcodeDialog';

export default function PolesTab() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.poles);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [barcodePole, setBarcodePole] = useState<Pole | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(fetchPoles({ page: page + 1, limit: rowsPerPage, searchText: search.trim() }));
    }, 300);
    return () => clearTimeout(handle);
  }, [dispatch, page, rowsPerPage, search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          placeholder="Search poles…"
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
              <TableCell>Pole Number</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Associate</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Meter Id</TableCell>
              <TableCell>Installed Date</TableCell>
              <TableCell>Barcode</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& tr:nth-of-type(even)': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {items.map((pole) => (
              <TableRow key={pole.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{pole.poleNumber}</TableCell>
                <TableCell>{pole.sectionName}</TableCell>
                <TableCell>{pole.locationName}</TableCell>
                <TableCell>{pole.associateName}</TableCell>
                <TableCell>{pole.latitude}</TableCell>
                <TableCell>{pole.longitude}</TableCell>
                <TableCell>{pole.meterId}</TableCell>
                <TableCell>{pole.installedDate}</TableCell>
                <TableCell>
                  <Tooltip title="View barcode">
                    <IconButton size="small" onClick={() => setBarcodePole(pole)}>
                      <QrCode2Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && status !== 'loading' && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No poles match the current search.
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
      <PoleBarcodeDialog open={Boolean(barcodePole)} onClose={() => setBarcodePole(null)} pole={barcodePole} />
    </Box>
  );
}
