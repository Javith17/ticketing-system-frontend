import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiGet, apiPut } from '../../api/client';

export type NcrThresholdScope = 'Location' | 'Section' | 'Pole';

export interface NcrThreshold {
  scope: NcrThresholdScope;
  maxTickets: number | null;
  windowDays: number | null;
}

interface BackendNcrThreshold {
  scope: NcrThresholdScope;
  max_tickets: number | null;
  window_days: number | null;
}

function toNcrThreshold(t: BackendNcrThreshold): NcrThreshold {
  return { scope: t.scope, maxTickets: t.max_tickets, windowDays: t.window_days };
}

interface NcrThresholdState {
  items: NcrThreshold[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  saveStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: NcrThresholdState = {
  items: [],
  status: 'idle',
  error: null,
  saveStatus: 'idle',
};

export const fetchNcrThresholds = createAsyncThunk('ncrThreshold/fetchNcrThresholds', async () => {
  const result = await apiGet<{ data: BackendNcrThreshold[] }>('/ncr-thresholds');
  return result.data.map(toNcrThreshold);
});

export const saveNcrThresholds = createAsyncThunk(
  'ncrThreshold/saveNcrThresholds',
  async (thresholds: { scope: NcrThresholdScope; maxTickets: number; windowDays: number }[]) => {
    const result = await apiPut<{ data: BackendNcrThreshold[] }>('/ncr-thresholds', {
      thresholds: thresholds.map((t) => ({
        scope: t.scope,
        max_tickets: t.maxTickets,
        window_days: t.windowDays,
      })),
    });
    return result.data.map(toNcrThreshold);
  },
);

const ncrThresholdSlice = createSlice({
  name: 'ncrThreshold',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNcrThresholds.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNcrThresholds.fulfilled, (state, action: PayloadAction<NcrThreshold[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNcrThresholds.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load NCR thresholds';
      })
      .addCase(saveNcrThresholds.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveNcrThresholds.fulfilled, (state, action: PayloadAction<NcrThreshold[]>) => {
        state.saveStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(saveNcrThresholds.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.error.message ?? 'Failed to save NCR thresholds';
      });
  },
});

export default ncrThresholdSlice.reducer;
