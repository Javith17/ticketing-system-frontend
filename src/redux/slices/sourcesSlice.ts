import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Source } from '../../types';
import { apiGet, apiPatch, apiPost } from '../../api/client';

interface BackendSource {
  id: string;
  source_name: string;
  description?: string;
}

interface SourcesListResponse {
  data: BackendSource[];
}

function toSource(source: BackendSource): Source {
  return {
    id: source.id,
    sourceName: source.source_name,
    description: source.description,
  };
}

interface SourcesState {
  items: Source[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SourcesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchSources = createAsyncThunk('sources/fetchSources', async () => {
  const result = await apiGet<SourcesListResponse>('/sources');
  return result.data.map(toSource);
});

export type CreateSourceInput = Omit<Source, 'id'>;

export const createSource = createAsyncThunk('sources/createSource', async (input: CreateSourceInput) => {
  const result = await apiPost<{ data: BackendSource }>('/sources', {
    source_name: input.sourceName,
    description: input.description || undefined,
  });
  return toSource(result.data);
});

export const updateSource = createAsyncThunk('sources/updateSource', async (source: Source) => {
  const result = await apiPatch<{ data: BackendSource }>(`/sources/${source.id}`, {
    source_name: source.sourceName,
    description: source.description || undefined,
  });
  return toSource(result.data);
});

const sourcesSlice = createSlice({
  name: 'sources',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSources.fulfilled, (state, action: PayloadAction<Source[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load sources';
      })
      .addCase(updateSource.fulfilled, (state, action: PayloadAction<Source>) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default sourcesSlice.reducer;
