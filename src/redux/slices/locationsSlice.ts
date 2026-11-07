import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Location } from '../../types';
import { apiPost } from '../../api/client';

interface BackendLocation {
  locationId: number;
  locationName: string;
  associateName?: string;
  remarks?: string;
  wapGroupName?: string;
}

interface LocationsListResponse {
  success: boolean;
  page: number;
  count: number;
  list: BackendLocation[];
}

function toLocation(loc: BackendLocation): Location {
  return {
    id: loc.locationId,
    name: loc.locationName,
    associateName: loc.associateName,
    remarks: loc.remarks,
    wapGroupName: loc.wapGroupName,
  };
}

interface LocationsState {
  items: Location[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LocationsState = {
  items: [],
  total: 0,
  status: 'idle',
  error: null,
};

export type FetchLocationsParams = { page: number; limit: number; searchText?: string };

export const fetchLocations = createAsyncThunk('locations/fetchLocations', async (params: FetchLocationsParams) => {
  const result = await apiPost<LocationsListResponse>('/master-details/locations', {
    page: params.page,
    limit: params.limit,
    searchText: params.searchText || '',
  });
  return { items: result.list.map(toLocation), total: result.count };
});

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocations.fulfilled, (state, action: PayloadAction<{ items: Location[]; total: number }>) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load locations';
      });
  },
});

export default locationsSlice.reducer;
