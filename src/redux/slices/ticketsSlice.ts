import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ReturnRemark,
  Severity,
  Ticket,
  TicketDetailEntry,
  TicketHistoryEntry,
  TicketSource,
  TicketStatus,
} from '../../types';
import { apiGet, apiPatch, apiPost, apiPostForm } from '../../api/client';

interface BackendReturnRemark {
  return_by?: string;
  remarks: string;
  returned_at: string;
}

interface BackendTicket {
  id: string;
  ticket_id: string;
  source: TicketSource;
  asset_id?: string;
  asset_name?: string;
  location_id?: number;
  location_name?: string;
  section_id?: number;
  section_name?: string;
  pole_id?: number;
  pole_name?: string;
  latitude?: number;
  longitude?: number;
  priority: Severity;
  status: TicketStatus;
  issue: string;
  description: string;
  public_user_first_name?: string;
  public_user_last_name?: string;
  user_name?: string;
  assigned_to?: string;
  assigned_rsm?: string;
  return_remarks?: BackendReturnRemark[];
  created_at: string;
}

interface TicketsListResponse {
  data: BackendTicket[];
}

interface BackendHistoryEntry {
  id: string;
  event_at: string;
  event_type: string;
  event_user?: string;
  event_user_name?: string;
  event_detail: string;
}

interface BackendDetailEntry {
  id: string;
  event: string;
  event_by?: string;
  event_by_name?: string;
  event_at: string;
  remarks?: string;
  test_values?: string;
  attachments?: string[];
}

function toTicket(ticket: BackendTicket): Ticket {
  const publicUserName = `${ticket.public_user_first_name ?? ''} ${ticket.public_user_last_name ?? ''}`.trim();

  return {
    id: ticket.id,
    complaintId: ticket.ticket_id,
    source: ticket.source,
    assetId: ticket.asset_id,
    asset: ticket.asset_name,
    locationId: ticket.location_id,
    locationName: ticket.location_name,
    sectionId: ticket.section_id,
    sectionName: ticket.section_name,
    poleId: ticket.pole_id,
    poleName: ticket.pole_name,
    latitude: ticket.latitude,
    longitude: ticket.longitude,
    severity: ticket.priority,
    status: ticket.status,
    title: ticket.issue,
    description: ticket.description,
    assignedUser: publicUserName || ticket.user_name || '',
    assignedTo: ticket.assigned_to,
    assignedRsm: ticket.assigned_rsm,
    returnRemarks: ticket.return_remarks?.map(
      (r): ReturnRemark => ({ returnBy: r.return_by, remarks: r.remarks, returnedAt: r.returned_at }),
    ),
    createdAt: ticket.created_at,
  };
}

function toHistoryEntry(entry: BackendHistoryEntry): TicketHistoryEntry {
  return {
    id: entry.id,
    eventAt: entry.event_at,
    eventType: entry.event_type,
    eventUser: entry.event_user,
    eventUserName: entry.event_user_name,
    eventDetail: entry.event_detail,
  };
}

function toDetailEntry(entry: BackendDetailEntry): TicketDetailEntry {
  return {
    id: entry.id,
    event: entry.event,
    eventBy: entry.event_by,
    eventByName: entry.event_by_name,
    eventAt: entry.event_at,
    remarks: entry.remarks,
    testValues: entry.test_values,
    attachments: entry.attachments ?? [],
  };
}

interface TicketsState {
  items: Ticket[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TicketsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTickets = createAsyncThunk('tickets/fetchTickets', async () => {
  const result = await apiGet<TicketsListResponse>('/tickets?limit=1000');
  return result.data.map(toTicket);
});

// Not stored in state.tickets.items - used to fill pickers that only need
// tickets in one status (e.g. the admin "Raise NCR" dialog, which lists
// Started tickets) without replacing the Tickets page's full list.
export const fetchTicketsByStatus = createAsyncThunk('tickets/fetchTicketsByStatus', async (status: string) => {
  const result = await apiGet<TicketsListResponse>(`/tickets?status=${encodeURIComponent(status)}&limit=1000`);
  return result.data.map(toTicket);
});

export interface CreateTicketInput {
  source: TicketSource;
  poleId: number;
  poleName: string;
  locationName: string;
  sectionName: string;
  locationId?: number;
  sectionId?: number;
  latitude?: number;
  longitude?: number;
  severity: Severity;
  title: string;
  description: string;
}

export const createTicket = createAsyncThunk('tickets/createTicket', async (input: CreateTicketInput) => {
  const result = await apiPost<{ data: BackendTicket }>('/tickets', {
    pole_id: input.poleId,
    pole_name: input.poleName,
    location_name: input.locationName,
    section_name: input.sectionName,
    location_id: input.locationId,
    section_id: input.sectionId,
    latitude: input.latitude,
    longitude: input.longitude,
    source: input.source,
    priority: input.severity,
    issue: input.title,
    description: input.description,
  });
  return toTicket(result.data);
});

export interface UpdateTicketInput {
  id: string;
  source: TicketSource;
  poleId: number;
  poleName: string;
  locationName: string;
  sectionName: string;
  locationId?: number;
  sectionId?: number;
  latitude?: number;
  longitude?: number;
  severity: Severity;
  title: string;
  description: string;
}

export const updateTicket = createAsyncThunk('tickets/updateTicket', async (input: UpdateTicketInput) => {
  const result = await apiPatch<{ data: BackendTicket }>(`/tickets/${input.id}`, {
    pole_id: input.poleId,
    pole_name: input.poleName,
    location_name: input.locationName,
    section_name: input.sectionName,
    location_id: input.locationId,
    section_id: input.sectionId,
    latitude: input.latitude,
    longitude: input.longitude,
    source: input.source,
    priority: input.severity,
    issue: input.title,
    description: input.description,
  });
  return toTicket(result.data);
});

export interface UpdateTicketStatusInput {
  id: string;
  status: TicketStatus;
  remarks?: string;
}

export const updateTicketStatus = createAsyncThunk(
  'tickets/updateTicketStatus',
  async ({ id, status, remarks }: UpdateTicketStatusInput) => {
    const result = await apiPatch<{ data: BackendTicket }>(`/tickets/${id}/status`, { status, remarks });
    return toTicket(result.data);
  },
);

export interface AssignRsmInput {
  id: string;
  assignedRsm: string;
}

export const assignRsm = createAsyncThunk('tickets/assignRsm', async ({ id, assignedRsm }: AssignRsmInput) => {
  const result = await apiPost<{ data: BackendTicket }>(`/tickets/${id}/assign-rsm`, { assigned_rsm: assignedRsm });
  return toTicket(result.data);
});

export interface AssignTechnicianInput {
  id: string;
  assignedTo: string;
}

export const assignTechnician = createAsyncThunk(
  'tickets/assignTechnician',
  async ({ id, assignedTo }: AssignTechnicianInput) => {
    const result = await apiPost<{ data: BackendTicket }>(`/tickets/${id}/assign-technician`, {
      assigned_to: assignedTo,
    });
    return toTicket(result.data);
  },
);

export interface ApproveClosureInput {
  id: string;
  remarks: string;
}

export const approveClosure = createAsyncThunk(
  'tickets/approveClosure',
  async ({ id, remarks }: ApproveClosureInput) => {
    const result = await apiPost<{ data: BackendTicket }>(`/tickets/${id}/approve-closure`, { remarks });
    return toTicket(result.data);
  },
);

// Technician execution steps (Accept -> Start -> Add Findings -> Close), also
// available to the super admin from the web. The backend returns the bare
// ticket row for these (no asset/reporter names), so they only patch the
// status of the row already in the list instead of replacing it.
interface TicketStatusPatch {
  id: string;
  status: TicketStatus;
}

// Assigned Technician -> In Progress (the technician has accepted the job).
export const acceptTicket = createAsyncThunk('tickets/acceptTicket', async (id: string): Promise<TicketStatusPatch> => {
  const result = await apiPatch<{ data: BackendTicket }>(`/tickets/${id}/status`, { status: 'In Progress' });
  return { id, status: result.data.status };
});

// In Progress -> Started, with remarks.
export const startTicketWork = createAsyncThunk(
  'tickets/startTicketWork',
  async ({ id, remarks }: { id: string; remarks: string }): Promise<TicketStatusPatch> => {
    const result = await apiPost<{ data: BackendTicket }>(`/tickets/${id}/start`, { remarks });
    return { id, status: result.data.status };
  },
);

// Log-only entry while Started: remarks, optional test values, up to 3 photos.
export interface AddFindingsInput {
  id: string;
  remarks: string;
  testValues?: string;
  attachments: File[];
}

export const addTicketFindings = createAsyncThunk(
  'tickets/addTicketFindings',
  async ({ id, remarks, testValues, attachments }: AddFindingsInput) => {
    const form = new FormData();
    form.append('remarks', remarks);
    if (testValues) form.append('test_values', testValues);
    attachments.forEach((file) => form.append('attachments', file));
    await apiPostForm(`/tickets/${id}/findings`, form);
    return id;
  },
);

// Started -> Closure Approval: description, remarks, up to 3 photos.
export interface CloseTicketWorkInput {
  id: string;
  description: string;
  remarks: string;
  attachments: File[];
}

export const closeTicketWork = createAsyncThunk(
  'tickets/closeTicketWork',
  async ({ id, description, remarks, attachments }: CloseTicketWorkInput): Promise<TicketStatusPatch> => {
    const form = new FormData();
    form.append('description', description);
    form.append('remarks', remarks);
    attachments.forEach((file) => form.append('attachments', file));
    const result = await apiPostForm<{ data: BackendTicket }>(`/tickets/${id}/close`, form);
    return { id, status: result.data.status };
  },
);

export const fetchTicketHistory = createAsyncThunk('tickets/fetchTicketHistory', async (id: string) => {
  const result = await apiGet<{ data: BackendHistoryEntry[] }>(`/tickets/${id}/history`);
  return result.data.map(toHistoryEntry);
});

export const fetchTicketDetails = createAsyncThunk('tickets/fetchTicketDetails', async (id: string) => {
  const result = await apiGet<{ data: BackendDetailEntry[] }>(`/tickets/${id}/details`);
  return result.data.map(toDetailEntry);
});

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load tickets';
      })
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.items.unshift(action.payload);
      })
      // These endpoints return the bare ticket row (no pole / reporter
      // names), so merge onto the existing list row instead of replacing it -
      // otherwise the Pole and User columns go blank until the next reload.
      .addMatcher(
        isAnyOf(
          updateTicket.fulfilled,
          updateTicketStatus.fulfilled,
          assignRsm.fulfilled,
          assignTechnician.fulfilled,
          approveClosure.fulfilled,
        ),
        (state, action: PayloadAction<Ticket>) => {
          const idx = state.items.findIndex((t) => t.id === action.payload.id);
          if (idx === -1) return;
          const old = state.items[idx];
          state.items[idx] = {
            ...old,
            ...action.payload,
            // Keep the old pole name only if the pole itself didn't change
            // (the ticket edit form can change it).
            poleName:
              action.payload.poleName || (action.payload.poleId === old.poleId ? old.poleName : action.payload.poleName),
            assignedUser: action.payload.assignedUser || old.assignedUser,
          };
        },
      )
      .addMatcher(
        isAnyOf(acceptTicket.fulfilled, startTicketWork.fulfilled, closeTicketWork.fulfilled),
        (state, action: PayloadAction<TicketStatusPatch>) => {
          const row = state.items.find((t) => t.id === action.payload.id);
          if (row) row.status = action.payload.status;
        },
      );
  },
});

export default ticketsSlice.reducer;
