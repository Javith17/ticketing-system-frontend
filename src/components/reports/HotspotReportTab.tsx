import { useEffect, useState } from 'react';
import type { AsyncThunk } from '@reduxjs/toolkit';
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import type { RootState } from '../../redux/store';
import { showSnackbar } from '../../redux/slices/uiSlice';
import type { HotspotReport } from '../../redux/slices/reportsSlice';
import type { Location } from '../../types';
import SearchableSelect from '../common/SearchableSelect';
import { searchLocationsForHotspot } from './hotspotSearch';

type Scope = 'location' | 'section' | 'pole';

interface BreadcrumbEntry {
  scope: Scope;
  parentId?: number;
  label: string;
}

type HotspotParams = { scope: Scope; parentId?: number; limit?: number; from?: string; to?: string };

interface HotspotReportTabProps {
  exportLabel: string;
  fetchThunk: AsyncThunk<HotspotReport, HotspotParams, object>;
  selectSlot: (state: RootState) => { data: HotspotReport | null; status: string };
}

export default function HotspotReportTab({ exportLabel, fetchThunk, selectSlot }: HotspotReportTabProps) {
  const dispatch = useAppDispatch();
  const slot = useAppSelector(selectSlot);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trail, setTrail] = useState<BreadcrumbEntry[]>([{ scope: 'location', label: 'Locations' }]);

  const current = trail[trail.length - 1];

  useEffect(() => {
    dispatch(fetchThunk({ scope: current.scope, parentId: current.parentId, from: from || undefined, to: to || undefined }));
    // Only re-fetch on drill navigation here - the Apply button handles date-range changes explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, fetchThunk, current.scope, current.parentId]);

  const handleApply = () => {
    dispatch(fetchThunk({ scope: current.scope, parentId: current.parentId, from: from || undefined, to: to || undefined }));
  };

  const drillInto = (row: { id: number; name: string }) => {
    if (current.scope === 'pole') return;
    const nextScope: Scope = current.scope === 'location' ? 'section' : 'pole';
    setTrail((prev) => [...prev, { scope: nextScope, parentId: row.id, label: row.name }]);
  };

  const goToCrumb = (index: number) => {
    setTrail((prev) => prev.slice(0, index + 1));
  };

  const jumpToLocation = (location: Location | null) => {
    if (!location) return;
    setTrail([
      { scope: 'location', label: 'Locations' },
      { scope: 'section', parentId: location.id, label: location.name },
    ]);
  };

  const rows = slot.data?.rows ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', p: 2, bgcolor: 'action.hover' }}>
        <TextField
          size="small"
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button size="small" variant="outlined" onClick={handleApply}>
          Apply
        </Button>
        <Box sx={{ minWidth: 240 }}>
          <SearchableSelect<Location>
            label="Jump to location"
            value={null}
            onChange={jumpToLocation}
            fetcher={searchLocationsForHotspot}
            getOptionLabel={(l) => l.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
          />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="outlined"
          onClick={() => dispatch(showSnackbar({ message: `Exporting ${exportLabel}…`, severity: 'info' }))}
        >
          Export
        </Button>
      </Box>
      <Box sx={{ px: 2, pt: 1.5 }}>
        <Breadcrumbs>
          {trail.map((entry, index) => (
            <Link
              key={index}
              component="button"
              underline={index === trail.length - 1 ? 'none' : 'hover'}
              color={index === trail.length - 1 ? 'text.primary' : 'primary'}
              onClick={() => goToCrumb(index)}
            >
              {entry.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>
      <Box sx={{ p: 2 }}>
        {slot.status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {slot.status !== 'loading' && rows.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No data for the selected range.
          </Typography>
        )}
        {slot.status !== 'loading' && rows.length > 0 && (
          <>
            <BarChart
              height={300}
              layout="horizontal"
              series={[{ data: rows.map((r) => r.count), label: 'Count' }]}
              yAxis={[{ data: rows.map((r) => r.name), scaleType: 'band' }]}
            />
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Drill</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>
                      {current.scope !== 'pole' && (
                        <Button size="small" onClick={() => drillInto(row)}>
                          Drill in
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Box>
    </Box>
  );
}
