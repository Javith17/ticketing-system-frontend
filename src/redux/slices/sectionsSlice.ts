import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Section } from '../../types';
import { apiPost } from '../../api/client';

interface BackendSection {
  sectionId: number;
  sectionName: string;
  displayName?: string | null;
  locationName?: string;
  associateName?: string;
  remarks?: string;
  wapGroupId?: string | null;
}

interface SectionsListResponse {
  success: boolean;
  page: number;
  count: number;
  list: BackendSection[];
}

function toSection(section: BackendSection): Section {
  return {
    id: section.sectionId,
    name: section.sectionName,
    displayName: section.displayName,
    locationName: section.locationName,
    associateName: section.associateName,
    remarks: section.remarks,
    wapGroupId: section.wapGroupId,
  };
}

interface SectionsState {
  items: Section[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SectionsState = {
  items: [],
  total: 0,
  status: 'idle',
  error: null,
};

export type FetchSectionsParams = { page: number; limit: number; searchText?: string; locationId?: number };

export const fetchSections = createAsyncThunk('sections/fetchSections', async (params: FetchSectionsParams) => {
  const result = await apiPost<SectionsListResponse>('/master-details/sections', {
    page: params.page,
    limit: params.limit,
    searchText: params.searchText || '',
    ...(params.locationId !== undefined ? { locationId: params.locationId } : {}),
  });
  return { items: result.list.map(toSection), total: result.count };
});

const sectionsSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSections.fulfilled, (state, action: PayloadAction<{ items: Section[]; total: number }>) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load sections';
      });
  },
});

export default sectionsSlice.reducer;
