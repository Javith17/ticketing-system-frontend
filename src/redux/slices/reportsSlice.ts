import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiGet } from '../../api/client';

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// --- Report response shapes (local to this slice - report DTOs, not core domain types) ---

export interface TrendPoint {
  day: string;
  count: number;
}
export interface TicketsOverview {
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  bySource: { source: string; count: number }[];
  trend: TrendPoint[];
}

export interface HotspotRow {
  id: number;
  name: string;
  count: number;
}
export interface HotspotReport {
  scope: 'location' | 'section' | 'pole';
  parentId: number | null;
  rows: HotspotRow[];
}

export interface OverdueTicketRow {
  id: string;
  ticket_id: string;
  issue: string;
  location_name: string | null;
  section_name: string | null;
  pole_name: string | null;
  priority: string;
  due_at: string;
  assigned_to: string | null;
}
export interface OverdueReport {
  count: number;
  list: OverdueTicketRow[];
  trend: TrendPoint[];
}

export interface ResolutionRow {
  groupKey?: string;
  avgSeconds: number | null;
  count: number;
}
export interface WorkloadRow {
  userId: string;
  userName: string | null;
  count: number;
}
export interface ResolutionWorkloadReport {
  resolutionTime: ResolutionRow | ResolutionRow[];
  openByTechnician: WorkloadRow[];
  openByRsm: WorkloadRow[];
}

export interface TimelineEvent {
  at: string;
  type: string;
  label: string;
  actor?: string | null;
  remarks?: string;
  source: 'ticket' | 'ticket_history' | 'ticket_details' | 'ncr' | 'ncr_review' | 'ncr_approval' | 'ncr_closure';
}
export interface TimelineReport {
  ticket: Record<string, unknown> | null;
  ncr: Record<string, unknown> | null;
  timeline: TimelineEvent[];
}

export interface NcrFunnelEntry {
  status: string;
  count: number;
}

export interface NcrAgingReport {
  avgRaisedToReviewedHours: number | null;
  avgReviewedToApprovedHours: number | null;
  avgApprovedToClosedHours: number | null;
  avgTotalCycleHours: number | null;
  sampleSize: number;
}

export interface AlertLogRow {
  id: string;
  scope: 'Location' | 'Section' | 'Pole';
  entity_name: string;
  entity_id: number | null;
  ticket_count: number;
  window_days: number;
  alert_date: string;
  seen: boolean;
  ncr_ticket_id: string | null;
}
export interface AlertBreachHistoryReport {
  list: AlertLogRow[];
  total: number;
  unresolvedCount: number;
  trend: TrendPoint[];
}

export interface TimeToNcrReport {
  avgHoursToNcr: number | null;
  sampleSize: number;
  byScope: { scope: string; avgHours: number | null; count: number }[];
}

// --- Thunks ---

export const fetchTicketsOverview = createAsyncThunk(
  'reports/fetchTicketsOverview',
  async (params: { from?: string; to?: string }) => {
    const result = await apiGet<{ data: TicketsOverview }>(`/reports/tickets/overview${buildQuery(params)}`);
    return result.data;
  },
);

export const fetchTicketsHotspot = createAsyncThunk(
  'reports/fetchTicketsHotspot',
  async (params: { scope: 'location' | 'section' | 'pole'; parentId?: number; limit?: number; from?: string; to?: string }) => {
    const result = await apiGet<{ data: HotspotReport }>(
      `/reports/tickets/hotspot${buildQuery({ scope: params.scope, parent_id: params.parentId, limit: params.limit, from: params.from, to: params.to })}`,
    );
    return result.data;
  },
);

export const fetchTicketsOverdue = createAsyncThunk(
  'reports/fetchTicketsOverdue',
  async (params: { from?: string; to?: string; page?: number; limit?: number }) => {
    const result = await apiGet<{ data: OverdueReport }>(`/reports/tickets/overdue${buildQuery(params)}`);
    return result.data;
  },
);

export const fetchResolutionWorkload = createAsyncThunk(
  'reports/fetchResolutionWorkload',
  async (params: { from?: string; to?: string; groupBy?: 'priority' | 'source' | 'location' }) => {
    const result = await apiGet<{ data: ResolutionWorkloadReport }>(
      `/reports/tickets/resolution-workload${buildQuery({ from: params.from, to: params.to, group_by: params.groupBy })}`,
    );
    return result.data;
  },
);

export const fetchTimeline = createAsyncThunk('reports/fetchTimeline', async (code: string) => {
  const result = await apiGet<{ data: TimelineReport }>(`/reports/timeline${buildQuery({ code })}`);
  return result.data;
});

export const fetchNcrFunnel = createAsyncThunk(
  'reports/fetchNcrFunnel',
  async (params: { from?: string; to?: string }) => {
    const result = await apiGet<{ data: NcrFunnelEntry[] }>(`/reports/ncr/funnel${buildQuery(params)}`);
    return result.data;
  },
);

export const fetchNcrAging = createAsyncThunk(
  'reports/fetchNcrAging',
  async (params: { from?: string; to?: string }) => {
    const result = await apiGet<{ data: NcrAgingReport }>(`/reports/ncr/aging${buildQuery(params)}`);
    return result.data;
  },
);

export const fetchNcrHotspot = createAsyncThunk(
  'reports/fetchNcrHotspot',
  async (params: { scope: 'location' | 'section' | 'pole'; parentId?: number; limit?: number; from?: string; to?: string }) => {
    const result = await apiGet<{ data: HotspotReport }>(
      `/reports/ncr/hotspot${buildQuery({ scope: params.scope, parent_id: params.parentId, limit: params.limit, from: params.from, to: params.to })}`,
    );
    return result.data;
  },
);

export const fetchAlertBreachHistory = createAsyncThunk(
  'reports/fetchAlertBreachHistory',
  async (params: { from?: string; to?: string; scope?: string; page?: number; limit?: number }) => {
    const result = await apiGet<{ data: AlertBreachHistoryReport }>(
      `/reports/alerts/breach-history${buildQuery(params)}`,
    );
    return result.data;
  },
);

export const fetchTimeToNcr = createAsyncThunk(
  'reports/fetchTimeToNcr',
  async (params: { from?: string; to?: string }) => {
    const result = await apiGet<{ data: TimeToNcrReport }>(`/reports/alerts/time-to-ncr${buildQuery(params)}`);
    return result.data;
  },
);

// --- State ---

interface ReportSlot<T> {
  data: T | null;
  status: FetchStatus;
  error: string | null;
}

function emptySlot<T>(): ReportSlot<T> {
  return { data: null, status: 'idle', error: null };
}

interface ReportsState {
  overview: ReportSlot<TicketsOverview>;
  ticketsHotspot: ReportSlot<HotspotReport>;
  overdue: ReportSlot<OverdueReport>;
  resolutionWorkload: ReportSlot<ResolutionWorkloadReport>;
  timeline: ReportSlot<TimelineReport>;
  ncrFunnel: ReportSlot<NcrFunnelEntry[]>;
  ncrAging: ReportSlot<NcrAgingReport>;
  ncrHotspot: ReportSlot<HotspotReport>;
  alertBreachHistory: ReportSlot<AlertBreachHistoryReport>;
  timeToNcr: ReportSlot<TimeToNcrReport>;
}

const initialState: ReportsState = {
  overview: emptySlot(),
  ticketsHotspot: emptySlot(),
  overdue: emptySlot(),
  resolutionWorkload: emptySlot(),
  timeline: emptySlot(),
  ncrFunnel: emptySlot(),
  ncrAging: emptySlot(),
  ncrHotspot: emptySlot(),
  alertBreachHistory: emptySlot(),
  timeToNcr: emptySlot(),
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsOverview.pending, (state) => {
        state.overview.status = 'loading';
      })
      .addCase(fetchTicketsOverview.fulfilled, (state, action: PayloadAction<TicketsOverview>) => {
        state.overview.status = 'succeeded';
        state.overview.data = action.payload;
      })
      .addCase(fetchTicketsOverview.rejected, (state, action) => {
        state.overview.status = 'failed';
        state.overview.error = action.error.message ?? 'Failed to load tickets overview';
      })
      .addCase(fetchTicketsHotspot.pending, (state) => {
        state.ticketsHotspot.status = 'loading';
      })
      .addCase(fetchTicketsHotspot.fulfilled, (state, action: PayloadAction<HotspotReport>) => {
        state.ticketsHotspot.status = 'succeeded';
        state.ticketsHotspot.data = action.payload;
      })
      .addCase(fetchTicketsHotspot.rejected, (state, action) => {
        state.ticketsHotspot.status = 'failed';
        state.ticketsHotspot.error = action.error.message ?? 'Failed to load ticket hotspot report';
      })
      .addCase(fetchTicketsOverdue.pending, (state) => {
        state.overdue.status = 'loading';
      })
      .addCase(fetchTicketsOverdue.fulfilled, (state, action: PayloadAction<OverdueReport>) => {
        state.overdue.status = 'succeeded';
        state.overdue.data = action.payload;
      })
      .addCase(fetchTicketsOverdue.rejected, (state, action) => {
        state.overdue.status = 'failed';
        state.overdue.error = action.error.message ?? 'Failed to load overdue tickets report';
      })
      .addCase(fetchResolutionWorkload.pending, (state) => {
        state.resolutionWorkload.status = 'loading';
      })
      .addCase(fetchResolutionWorkload.fulfilled, (state, action: PayloadAction<ResolutionWorkloadReport>) => {
        state.resolutionWorkload.status = 'succeeded';
        state.resolutionWorkload.data = action.payload;
      })
      .addCase(fetchResolutionWorkload.rejected, (state, action) => {
        state.resolutionWorkload.status = 'failed';
        state.resolutionWorkload.error = action.error.message ?? 'Failed to load resolution & workload report';
      })
      .addCase(fetchTimeline.pending, (state) => {
        state.timeline.status = 'loading';
      })
      .addCase(fetchTimeline.fulfilled, (state, action: PayloadAction<TimelineReport>) => {
        state.timeline.status = 'succeeded';
        state.timeline.data = action.payload;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.timeline.status = 'failed';
        state.timeline.error = action.error.message ?? 'Failed to load timeline';
      })
      .addCase(fetchNcrFunnel.pending, (state) => {
        state.ncrFunnel.status = 'loading';
      })
      .addCase(fetchNcrFunnel.fulfilled, (state, action: PayloadAction<NcrFunnelEntry[]>) => {
        state.ncrFunnel.status = 'succeeded';
        state.ncrFunnel.data = action.payload;
      })
      .addCase(fetchNcrFunnel.rejected, (state, action) => {
        state.ncrFunnel.status = 'failed';
        state.ncrFunnel.error = action.error.message ?? 'Failed to load NCR funnel report';
      })
      .addCase(fetchNcrAging.pending, (state) => {
        state.ncrAging.status = 'loading';
      })
      .addCase(fetchNcrAging.fulfilled, (state, action: PayloadAction<NcrAgingReport>) => {
        state.ncrAging.status = 'succeeded';
        state.ncrAging.data = action.payload;
      })
      .addCase(fetchNcrAging.rejected, (state, action) => {
        state.ncrAging.status = 'failed';
        state.ncrAging.error = action.error.message ?? 'Failed to load NCR aging report';
      })
      .addCase(fetchNcrHotspot.pending, (state) => {
        state.ncrHotspot.status = 'loading';
      })
      .addCase(fetchNcrHotspot.fulfilled, (state, action: PayloadAction<HotspotReport>) => {
        state.ncrHotspot.status = 'succeeded';
        state.ncrHotspot.data = action.payload;
      })
      .addCase(fetchNcrHotspot.rejected, (state, action) => {
        state.ncrHotspot.status = 'failed';
        state.ncrHotspot.error = action.error.message ?? 'Failed to load NCR hotspot report';
      })
      .addCase(fetchAlertBreachHistory.pending, (state) => {
        state.alertBreachHistory.status = 'loading';
      })
      .addCase(fetchAlertBreachHistory.fulfilled, (state, action: PayloadAction<AlertBreachHistoryReport>) => {
        state.alertBreachHistory.status = 'succeeded';
        state.alertBreachHistory.data = action.payload;
      })
      .addCase(fetchAlertBreachHistory.rejected, (state, action) => {
        state.alertBreachHistory.status = 'failed';
        state.alertBreachHistory.error = action.error.message ?? 'Failed to load alert breach history';
      })
      .addCase(fetchTimeToNcr.pending, (state) => {
        state.timeToNcr.status = 'loading';
      })
      .addCase(fetchTimeToNcr.fulfilled, (state, action: PayloadAction<TimeToNcrReport>) => {
        state.timeToNcr.status = 'succeeded';
        state.timeToNcr.data = action.payload;
      })
      .addCase(fetchTimeToNcr.rejected, (state, action) => {
        state.timeToNcr.status = 'failed';
        state.timeToNcr.error = action.error.message ?? 'Failed to load time-to-NCR report';
      });
  },
});

export default reportsSlice.reducer;
