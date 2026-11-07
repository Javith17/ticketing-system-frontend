import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Designation, User } from '../../types';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../api/client';

interface BackendUser {
  id: string;
  employee_code: string;
  first_name: string;
  last_name?: string;
  designation?: string;
  email: string;
  role_id: string;
  phone?: string;
  is_active?: boolean;
}

interface UsersListResponse {
  data: BackendUser[];
  total: number;
}

function toUser(user: BackendUser): User {
  return {
    id: user.id,
    employeeCode: user.employee_code,
    firstName: user.first_name,
    lastName: user.last_name ?? '',
    designation: (user.designation as Designation) ?? '',
    email: user.email,
    roleId: user.role_id,
    phone: user.phone,
    isActive: user.is_active,
  };
}

interface UsersState {
  items: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const result = await apiGet<UsersListResponse>('/users?limit=1000');
  return result.data.map(toUser);
});

// Not stored in state.users.items - used to populate role-scoped dropdowns
// (e.g. Assign RSM/Assign Technician pickers) without clobbering the full
// user list the Users admin page relies on.
export const fetchUsersByRole = createAsyncThunk('users/fetchUsersByRole', async (roleCode: string) => {
  const result = await apiGet<UsersListResponse>(`/users?role_code=${roleCode}&limit=1000`);
  return result.data.map(toUser);
});

export type CreateUserInput = {
  employeeCode: string;
  firstName: string;
  lastName?: string;
  designation?: Designation | '';
  email: string;
  roleId: string;
  phone?: string;
};

export const createUser = createAsyncThunk('users/createUser', async (input: CreateUserInput) => {
  const result = await apiPost<{ data: BackendUser }>('/users', {
    employee_code: input.employeeCode,
    first_name: input.firstName,
    last_name: input.lastName || undefined,
    designation: input.designation || undefined,
    email: input.email,
    role_id: input.roleId,
    phone: input.phone || undefined,
  });
  return toUser(result.data);
});

export const updateUser = createAsyncThunk('users/updateUser', async (user: User) => {
  const result = await apiPatch<{ data: BackendUser }>(`/users/${user.id}`, {
    first_name: user.firstName,
    last_name: user.lastName || undefined,
    designation: user.designation || undefined,
    email: user.email,
    role_id: user.roleId,
    phone: user.phone || undefined,
  });
  return toUser(result.data);
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id: string) => {
  await apiDelete(`/users/${id}`);
  return id;
});

export const sendTestNotification = createAsyncThunk('users/sendTestNotification', async (id: string) => {
  const result = await apiPost<{ message: string }>(`/users/${id}/send-test-notification`);
  return { id, message: result.message };
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load users';
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.items.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
