import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Asset } from '../../types';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../api/client';

interface BackendAsset {
  id: string;
  asset_name: string;
  panel: string;
  site?: string;
  location?: string;
  coordinates?: string;
  description?: string;
  barcode?: string;
}

interface AssetsListResponse {
  data: BackendAsset[];
}

function toAsset(asset: BackendAsset): Asset {
  return {
    id: asset.id,
    name: asset.asset_name,
    panel: asset.panel,
    site: asset.site,
    location: asset.location,
    coordinates: asset.coordinates,
    description: asset.description,
    barcode: asset.barcode,
  };
}

interface AssetsState {
  items: Asset[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AssetsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchAssets = createAsyncThunk('assets/fetchAssets', async () => {
  const result = await apiGet<AssetsListResponse>('/assets');
  return result.data.map(toAsset);
});

export type CreateAssetInput = Omit<Asset, 'id'>;

export const createAsset = createAsyncThunk('assets/createAsset', async (input: CreateAssetInput) => {
  const result = await apiPost<{ data: BackendAsset }>('/assets', {
    asset_name: input.name,
    panel: input.panel,
    site: input.site || undefined,
    location: input.location || undefined,
    coordinates: input.coordinates || undefined,
    description: input.description || undefined,
    barcode: input.barcode || undefined,
  });
  return toAsset(result.data);
});

export const updateAsset = createAsyncThunk('assets/updateAsset', async (asset: Asset) => {
  const result = await apiPatch<{ data: BackendAsset }>(`/assets/${asset.id}`, {
    asset_name: asset.name,
    panel: asset.panel,
    site: asset.site || undefined,
    location: asset.location || undefined,
    coordinates: asset.coordinates || undefined,
    description: asset.description || undefined,
    barcode: asset.barcode || undefined,
  });
  return toAsset(result.data);
});

export const deleteAsset = createAsyncThunk('assets/deleteAsset', async (id: string) => {
  await apiDelete(`/assets/${id}`);
  return id;
});

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssets.fulfilled, (state, action: PayloadAction<Asset[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load assets';
      })
      .addCase(createAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAsset.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export default assetsSlice.reducer;
