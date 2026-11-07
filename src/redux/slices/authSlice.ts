import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types';
import { apiPost, ApiError, getAuthToken, setAuthToken } from '../../api/client';

const USER_KEY = 'ticketing-auth-user';

export interface LoginPayload {
  email: string;
  password: string;
}

interface SignInResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role_id: string;
    role_name?: string;
    roleCode?: string;
  };
}

function toAuthUser(user: SignInResponse['user']): AuthUser {
  return {
    id: user.id,
    email: user.email,
    roleId: user.role_id,
    roleName: user.role_name,
    roleCode: user.roleCode,
    displayName: user.full_name,
  };
}

export const loginUser = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await apiPost<SignInResponse>('/auth/signIn', { email, password }, { auth: false });
      const user = toAuthUser(result.user);
      setAuthToken(result.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Invalid credentials. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk<string, string, { rejectValue: string }>(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const result = await apiPost<{ message: string }>('/auth/forgot-password', { email }, { auth: false });
      return result.message;
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Unable to process the request.';
      return rejectWithValue(message);
    }
  }
);

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  resetMessage: string | null;
}

const initialState: AuthState = {
  user: loadStoredUser(),
  token: getAuthToken(),
  status: 'idle',
  error: null,
  resetMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      setAuthToken(null);
      localStorage.removeItem(USER_KEY);
    },
    clearAuthError(state) {
      state.error = null;
      state.resetMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.token = getAuthToken();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Invalid credentials. Please try again.';
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.resetMessage = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to send reset link.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
