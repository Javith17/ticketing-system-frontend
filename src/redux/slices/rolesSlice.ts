import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../../types';
import { apiGet, apiPatch, apiPost } from '../../api/client';

interface BackendRole {
  id: string;
  role_code: string;
  role_name: string;
  features: string[];
  approvals: string[];
}

interface RolesListResponse {
  data: BackendRole[];
}

function toRole(role: BackendRole): Role {
  return {
    id: role.id,
    roleCode: role.role_code,
    roleName: role.role_name,
    features: role.features ?? [],
    approvals: role.approvals ?? [],
  };
}

interface RolesState {
  items: Role[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RolesState = {
  items: [],
  status: 'idle',
  error: null,
};

// No page/limit params -> backend returns the full, unpaginated role list.
export const fetchRoles = createAsyncThunk('roles/fetchRoles', async () => {
  const result = await apiGet<RolesListResponse>('/roles');
  return result.data.map(toRole);
});

export type CreateRoleInput = {
  roleCode: string;
  roleName: string;
  features: string[];
  approvals: string[];
};

export const createRole = createAsyncThunk('roles/createRole', async (input: CreateRoleInput) => {
  const result = await apiPost<{ data: BackendRole }>('/roles', {
    role_code: input.roleCode,
    role_name: input.roleName,
    features: input.features,
    approvals: input.approvals,
  });
  return toRole(result.data);
});

export const updateRole = createAsyncThunk('roles/updateRole', async (role: Role) => {
  // role_code is immutable once created - the backend ignores it on update.
  const result = await apiPatch<{ data: BackendRole }>(`/roles/${role.id}`, {
    role_name: role.roleName,
    features: role.features,
    approvals: role.approvals,
  });
  return toRole(result.data);
});

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load roles';
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default rolesSlice.reducer;
