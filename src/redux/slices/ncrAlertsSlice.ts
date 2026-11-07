import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiGet, apiPatch, apiPost } from '../../api/client';

export interface NcrAlert {
  id: string;
  scope: 'Location' | 'Section' | 'Pole';
  entityId: number | null;
  entityName: string;
  ticketCount: number;
  windowDays: number;
  alertDate: string;
  seen: boolean;
  ncrTicketId: string | null;
}

interface BackendNcrAlert {
  id: string;
  scope: 'Location' | 'Section' | 'Pole';
  entity_id: number | null;
  entity_name: string;
  ticket_count: number;
  window_days: number;
  alert_date: string;
  seen: boolean;
  ncr_ticket_id: string | null;
}

function toNcrAlert(a: BackendNcrAlert): NcrAlert {
  return {
    id: a.id,
    scope: a.scope,
    entityId: a.entity_id,
    entityName: a.entity_name,
    ticketCount: a.ticket_count,
    windowDays: a.window_days,
    alertDate: a.alert_date,
    seen: a.seen,
    ncrTicketId: a.ncr_ticket_id,
  };
}

interface NcrAlertsState {
  items: NcrAlert[];
  unseenCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NcrAlertsState = {
  items: [],
  unseenCount: 0,
  status: 'idle',
  error: null,
};

export const fetchUnseenAlertCount = createAsyncThunk('ncrAlerts/fetchUnseenAlertCount', async () => {
  const result = await apiGet<{ data: { count: number } }>('/ncr-alerts/unseen-count');
  return result.data.count;
});

export const fetchAlerts = createAsyncThunk('ncrAlerts/fetchAlerts', async () => {
  const result = await apiGet<{ data: BackendNcrAlert[] }>('/ncr-alerts?limit=50');
  return result.data.map(toNcrAlert);
});

export const markAlertsSeen = createAsyncThunk('ncrAlerts/markAlertsSeen', async () => {
  await apiPatch('/ncr-alerts/mark-seen');
});

export const raiseNcrFromAlert = createAsyncThunk('ncrAlerts/raiseNcrFromAlert', async (alertId: string) => {
  const result = await apiPost<{ data: { id: string } }>(`/ncr-alerts/${alertId}/raise-ncr`);
  return { alertId, ncrTicketId: result.data.id };
});

const ncrAlertsSlice = createSlice({
  name: 'ncrAlerts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnseenAlertCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unseenCount = action.payload;
      })
      .addCase(fetchAlerts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<NcrAlert[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load NCR alerts';
      })
      .addCase(markAlertsSeen.fulfilled, (state) => {
        state.unseenCount = 0;
        state.items = state.items.map((a) => ({ ...a, seen: true }));
      })
      .addCase(raiseNcrFromAlert.fulfilled, (state, action: PayloadAction<{ alertId: string; ncrTicketId: string }>) => {
        const alert = state.items.find((a) => a.id === action.payload.alertId);
        if (alert) alert.ncrTicketId = action.payload.ncrTicketId;
      });
  },
});

export default ncrAlertsSlice.reducer;
