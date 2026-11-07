import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../../types';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../api/client';

interface BackendCategory {
  id: string;
  category_code: string;
  category_name: string;
  description?: string;
  ticket_count?: number;
}

interface CategoriesListResponse {
  data: BackendCategory[];
}

function toCategory(category: BackendCategory): Category {
  return {
    id: category.id,
    categoryCode: category.category_code,
    name: category.category_name,
    description: category.description,
    ticketCount: category.ticket_count ?? 0,
  };
}

interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const result = await apiGet<CategoriesListResponse>('/categories?limit=1000');
  return result.data.map(toCategory);
});

export type CreateCategoryInput = Omit<Category, 'id' | 'ticketCount'>;

export const createCategory = createAsyncThunk('categories/createCategory', async (input: CreateCategoryInput) => {
  const result = await apiPost<{ data: BackendCategory }>('/categories', {
    category_code: input.categoryCode,
    category_name: input.name,
    description: input.description || undefined,
  });
  return toCategory(result.data);
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async (category: Category) => {
  const result = await apiPatch<{ data: BackendCategory }>(`/categories/${category.id}`, {
    category_code: category.categoryCode,
    category_name: category.name,
    description: category.description || undefined,
  });
  return toCategory(result.data);
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (id: string) => {
  await apiDelete(`/categories/${id}`);
  return id;
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load categories';
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
