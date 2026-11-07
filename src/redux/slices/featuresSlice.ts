import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature } from '../../types';
import { apiGet, apiPatch, apiPost } from '../../api/client';

interface BackendFeature {
  id: string;
  feature: string;
  is_approval: boolean;
}

interface FeaturesListResponse {
  data: BackendFeature[];
}

function toFeature(feature: BackendFeature): Feature {
  return {
    id: feature.id,
    feature: feature.feature,
    isApproval: feature.is_approval,
  };
}

interface FeaturesState {
  items: Feature[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FeaturesState = {
  items: [],
  status: 'idle',
  error: null,
};

// High limit so this doubles as the "give me every feature" call used to
// populate the Roles form's feature dropdown, not just a single page.
export const fetchFeatures = createAsyncThunk('features/fetchFeatures', async () => {
  const result = await apiGet<FeaturesListResponse>('/features?limit=1000');
  return result.data.map(toFeature);
});

export type CreateFeatureInput = {
  feature: string;
  isApproval: boolean;
};

export const createFeature = createAsyncThunk('features/createFeature', async (input: CreateFeatureInput) => {
  const result = await apiPost<{ data: BackendFeature }>('/features', {
    feature: input.feature,
    is_approval: input.isApproval,
  });
  return toFeature(result.data);
});

export const updateFeature = createAsyncThunk('features/updateFeature', async (feature: Feature) => {
  const result = await apiPatch<{ data: BackendFeature }>(`/features/${feature.id}`, {
    feature: feature.feature,
    is_approval: feature.isApproval,
  });
  return toFeature(result.data);
});

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatures.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeatures.fulfilled, (state, action: PayloadAction<Feature[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFeatures.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load features';
      })
      .addCase(createFeature.fulfilled, (state, action: PayloadAction<Feature>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateFeature.fulfilled, (state, action: PayloadAction<Feature>) => {
        const idx = state.items.findIndex((f) => f.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default featuresSlice.reducer;
