import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiGet, apiPost, apiPut } from '../../api/client';

export interface EmailSettings {
  emailId: string;
  isConfigured: boolean;
}

interface BackendEmailSettings {
  email_id: string;
  is_configured: boolean;
}

function toEmailSettings(settings: BackendEmailSettings): EmailSettings {
  return {
    emailId: settings.email_id ?? '',
    isConfigured: Boolean(settings.is_configured),
  };
}

interface EmailSettingsState {
  settings: EmailSettings | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  saveStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  testStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: EmailSettingsState = {
  settings: null,
  status: 'idle',
  error: null,
  saveStatus: 'idle',
  testStatus: 'idle',
};

export const fetchEmailSettings = createAsyncThunk('emailSettings/fetchEmailSettings', async () => {
  const result = await apiGet<BackendEmailSettings>('/email-settings');
  return toEmailSettings(result);
});

export interface SaveEmailSettingsInput {
  emailId: string;
  password: string;
}

export const saveEmailSettings = createAsyncThunk(
  'emailSettings/saveEmailSettings',
  async ({ emailId, password }: SaveEmailSettingsInput) => {
    const result = await apiPut<BackendEmailSettings>('/email-settings', { email_id: emailId, password });
    return toEmailSettings(result);
  },
);

export interface TestEmailResult {
  success: boolean;
  message: string;
}

export const testEmailSettings = createAsyncThunk('emailSettings/testEmailSettings', async (to: string) => {
  const result = await apiPost<TestEmailResult>('/email-settings/test-email', { to });
  return result;
});

const emailSettingsSlice = createSlice({
  name: 'emailSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmailSettings.fulfilled, (state, action: PayloadAction<EmailSettings>) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchEmailSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load email settings';
      })
      .addCase(saveEmailSettings.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveEmailSettings.fulfilled, (state, action: PayloadAction<EmailSettings>) => {
        state.saveStatus = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(saveEmailSettings.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.error.message ?? 'Failed to save email settings';
      })
      .addCase(testEmailSettings.pending, (state) => {
        state.testStatus = 'loading';
      })
      .addCase(testEmailSettings.fulfilled, (state) => {
        state.testStatus = 'succeeded';
      })
      .addCase(testEmailSettings.rejected, (state, action) => {
        state.testStatus = 'failed';
        state.error = action.error.message ?? 'Failed to send test email';
      });
  },
});

export default emailSettingsSlice.reducer;
