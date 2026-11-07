import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pole } from '../../types';
import { apiPost } from '../../api/client';

interface BackendPole {
  poleId: number;
  poleNumber: string;
  sectionName?: string;
  locationName?: string;
  associateName?: string;
  latitude?: number;
  longitude?: number;
  meterId?: number;
  installedDate?: string | null;
}

interface PolesListResponse {
  success: boolean;
  page: number;
  count: number;
  list: BackendPole[];
}

function toPole(pole: BackendPole): Pole {
  return {
    id: pole.poleId,
    poleNumber: pole.poleNumber,
    sectionName: pole.sectionName,
    locationName: pole.locationName,
    associateName: pole.associateName,
    latitude: pole.latitude,
    longitude: pole.longitude,
    meterId: pole.meterId,
    installedDate: pole.installedDate,
  };
}

interface PolesState {
  items: Pole[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PolesState = {
  items: [],
  total: 0,
  status: 'idle',
  error: null,
};

export type FetchPolesParams = { page: number; limit: number; searchText?: string; sectionId?: number };

export const fetchPoles = createAsyncThunk('poles/fetchPoles', async (params: FetchPolesParams) => {
  const result = await apiPost<PolesListResponse>('/master-details/poles', {
    page: params.page,
    limit: params.limit,
    searchText: params.searchText || '',
    ...(params.sectionId !== undefined ? { sectionId: params.sectionId } : {}),
  });
  return { items: result.list.map(toPole), total: result.count };
});

const polesSlice = createSlice({
  name: 'poles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPoles.fulfilled, (state, action: PayloadAction<{ items: Pole[]; total: number }>) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchPoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load poles';
      });
  },
});

export default polesSlice.reducer;
