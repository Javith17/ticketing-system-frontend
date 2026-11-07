import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type {
  NcrApprovalDetail,
  NcrClosureDetail,
  NcrLinkedTicket,
  NcrMaterialRequest,
  NcrMaterialRequestItem,
  NcrMaterialReturn,
  NcrReviewDetail,
  NcrStatus,
  NcrTicket,
} from '../../types';
import { apiGet, apiPatch, apiPatchForm, apiPost, apiPostForm } from '../../api/client';

interface BackendLinkedTicket {
  ticket_id: string;
  ticket_no: string;
}

interface BackendReviewDetail {
  review_type: string;
  reviewed_by: string;
  reviewed_by_name?: string | null;
  reviewed_at: string;
  review_remarks: string;
}

interface BackendApprovalDetail {
  approval_type: string;
  approved_by: string;
  approved_by_name?: string | null;
  approved_at: string;
  approval_remarks: string;
}

interface BackendClosureDetail {
  closure_type: string;
  closure_remarks: string;
  closure_by: string;
  closure_by_name?: string | null;
  closure_at: string;
  closure_attachments?: string[];
}

interface BackendNcrTicket {
  id: string;
  ticket_id: string;
  description: string;
  status: NcrStatus;
  linked_tickets?: BackendLinkedTicket[];
  raised_by?: string;
  raised_by_name?: string | null;
  created_by?: string;
  created_by_name?: string | null;
  review_detail?: BackendReviewDetail[];
  approval_details?: BackendApprovalDetail[];
  closure_details?: BackendClosureDetail[];
  created_at: string;
}

interface NcrListResponse {
  data: BackendNcrTicket[];
}

function toLinkedTicket(t: BackendLinkedTicket): NcrLinkedTicket {
  return { ticketId: t.ticket_id, ticketNo: t.ticket_no };
}

function toReviewDetail(r: BackendReviewDetail): NcrReviewDetail {
  return {
    reviewType: r.review_type,
    reviewedBy: r.reviewed_by,
    reviewedByName: r.reviewed_by_name ?? null,
    reviewedAt: r.reviewed_at,
    reviewRemarks: r.review_remarks,
  };
}

function toApprovalDetail(a: BackendApprovalDetail): NcrApprovalDetail {
  return {
    approvalType: a.approval_type,
    approvedBy: a.approved_by,
    approvedByName: a.approved_by_name ?? null,
    approvedAt: a.approved_at,
    approvalRemarks: a.approval_remarks,
  };
}

function toClosureDetail(c: BackendClosureDetail): NcrClosureDetail {
  return {
    closureType: c.closure_type,
    closureRemarks: c.closure_remarks,
    closureBy: c.closure_by,
    closureByName: c.closure_by_name ?? null,
    closureAt: c.closure_at,
    closureAttachments: c.closure_attachments ?? [],
  };
}

function toNcrTicket(ticket: BackendNcrTicket): NcrTicket {
  return {
    id: ticket.id,
    ticketNo: ticket.ticket_id,
    description: ticket.description,
    status: ticket.status,
    linkedTickets: (ticket.linked_tickets ?? []).map(toLinkedTicket),
    reviewDetail: (ticket.review_detail ?? []).map(toReviewDetail),
    approvalDetails: (ticket.approval_details ?? []).map(toApprovalDetail),
    closureDetails: (ticket.closure_details ?? []).map(toClosureDetail),
    raisedBy: ticket.raised_by,
    raisedByName: ticket.raised_by_name ?? null,
    createdBy: ticket.created_by,
    createdByName: ticket.created_by_name ?? null,
    createdAt: ticket.created_at,
  };
}

// Postgres numeric columns arrive as strings - normalise to numbers.
type Numeric = number | string;
const num = (v: Numeric | null | undefined): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

interface BackendMaterialIssue {
  id: string;
  quantity: Numeric;
  serial_no?: string | null;
  batch_no?: string | null;
}

interface BackendMaterialRequestDetail {
  id: string;
  material_name: string;
  material_qty: Numeric;
  approved_qty?: Numeric | null;
  issued_qty?: Numeric | null;
  issues?: BackendMaterialIssue[];
}

interface BackendMaterialReturn {
  id: string;
  ncr_material_request_detail_id?: string | null;
  item_name: string;
  quantity: Numeric;
  serial_no?: string | null;
  batch_no?: string | null;
  condition_remarks?: string | null;
  attachments?: string[];
  returned_by_name?: string | null;
  returned_at?: string | null;
  disposition?: string | null;
  disposition_remarks?: string | null;
  disposition_by_name?: string | null;
  disposition_at?: string | null;
}

interface BackendMaterialRequest {
  id: string;
  ncr_ticket_id: string;
  remarks?: string;
  status: string;
  materials: BackendMaterialRequestDetail[];
  issue_remarks?: string | null;
  issued_by_name?: string | null;
  issued_at?: string | null;
  receipt_remarks?: string | null;
  received_by_name?: string | null;
  received_at?: string | null;
  returns?: BackendMaterialReturn[];
}

function toMaterialRequestItem(d: BackendMaterialRequestDetail): NcrMaterialRequestItem {
  return {
    id: d.id,
    materialName: d.material_name,
    materialQty: num(d.material_qty) ?? 0,
    approvedQty: num(d.approved_qty),
    issuedQty: num(d.issued_qty),
    issues: (d.issues ?? []).map((i) => ({
      id: i.id,
      quantity: num(i.quantity) ?? 0,
      serialNo: i.serial_no ?? null,
      batchNo: i.batch_no ?? null,
    })),
  };
}

function toMaterialReturn(r: BackendMaterialReturn): NcrMaterialReturn {
  return {
    id: r.id,
    detailId: r.ncr_material_request_detail_id ?? null,
    itemName: r.item_name,
    quantity: num(r.quantity) ?? 0,
    serialNo: r.serial_no ?? null,
    batchNo: r.batch_no ?? null,
    conditionRemarks: r.condition_remarks ?? null,
    attachments: r.attachments ?? [],
    returnedByName: r.returned_by_name ?? null,
    returnedAt: r.returned_at ?? null,
    disposition: r.disposition ?? null,
    dispositionRemarks: r.disposition_remarks ?? null,
    dispositionByName: r.disposition_by_name ?? null,
    dispositionAt: r.disposition_at ?? null,
  };
}

function toMaterialRequest(request: BackendMaterialRequest, fallbackNcrId = ''): NcrMaterialRequest {
  return {
    id: request.id,
    ncrTicketId: request.ncr_ticket_id ?? fallbackNcrId,
    remarks: request.remarks,
    status: request.status,
    details: (request.materials ?? []).map(toMaterialRequestItem),
    issueRemarks: request.issue_remarks ?? null,
    issuedByName: request.issued_by_name ?? null,
    issuedAt: request.issued_at ?? null,
    receiptRemarks: request.receipt_remarks ?? null,
    receivedByName: request.received_by_name ?? null,
    receivedAt: request.received_at ?? null,
    returns: (request.returns ?? []).map(toMaterialReturn),
  };
}

interface NcrState {
  items: NcrTicket[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  detail: NcrTicket | null;
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  materialRequest: NcrMaterialRequest | null;
  materialRequestStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: NcrState = {
  items: [],
  status: 'idle',
  error: null,
  detail: null,
  detailStatus: 'idle',
  materialRequest: null,
  materialRequestStatus: 'idle',
};

export const fetchNcrTickets = createAsyncThunk('ncr/fetchNcrTickets', async (status?: string) => {
  const query = status && status !== 'All' ? `&status=${encodeURIComponent(status)}` : '';
  const result = await apiGet<NcrListResponse>(`/ncr-tickets?limit=1000${query}`);
  return result.data.map(toNcrTicket);
});

export const fetchNcrDetail = createAsyncThunk('ncr/fetchNcrDetail', async (id: string) => {
  const result = await apiGet<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}`);
  return toNcrTicket(result.data);
});

export interface RaiseNcrInput {
  ticketId: string; // tickets.id (uuid) the NCR is raised against
  technicianId: string; // technician the super admin raises it on behalf of
  description: string;
}

export const raiseNcr = createAsyncThunk('ncr/raiseNcr', async ({ ticketId, technicianId, description }: RaiseNcrInput) => {
  const result = await apiPost<{ data: BackendNcrTicket }>('/ncr-tickets', {
    ticket_id: ticketId,
    raised_by: technicianId,
    description,
  });
  return toNcrTicket(result.data);
});

export interface CreateMaterialRequestInput {
  ncrTicketId: string;
  remarks?: string;
  materials: { materialName: string; materialQty: number }[];
}

export const createMaterialRequest = createAsyncThunk(
  'ncr/createMaterialRequest',
  async ({ ncrTicketId, remarks, materials }: CreateMaterialRequestInput) => {
    await apiPost('/ncr-material-requests', {
      ncr_ticket_id: ncrTicketId,
      remarks,
      materials: materials.map((m) => ({ material_name: m.materialName, material_qty: m.materialQty })),
    });
    // Creating the request moves the NCR to Material_request_Initiated -
    // re-fetch it so the list and open dialog pick up the new status.
    const result = await apiGet<{ data: BackendNcrTicket }>(`/ncr-tickets/${ncrTicketId}`);
    return toNcrTicket(result.data);
  },
);

export interface TechnicianClosureInput {
  id: string;
  remarks: string;
  attachments: File[]; // up to 3 images, sent as multipart field 'attachments'
}

export const technicianCloseNcr = createAsyncThunk(
  'ncr/technicianCloseNcr',
  async ({ id, remarks, attachments }: TechnicianClosureInput) => {
    const form = new FormData();
    form.append('remarks', remarks);
    attachments.forEach((file) => form.append('attachments', file));
    const result = await apiPatchForm<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}/technician-closure`, form);
    return toNcrTicket(result.data);
  },
);

export interface SubmitQualityReviewInput {
  id: string;
  reviewRemarks: string;
}

export const submitQualityReview = createAsyncThunk(
  'ncr/submitQualityReview',
  async ({ id, reviewRemarks }: SubmitQualityReviewInput) => {
    const result = await apiPatch<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}/quality-review`, {
      review_remarks: reviewRemarks,
    });
    return toNcrTicket(result.data);
  },
);

export interface ApprovalActionInput {
  id: string;
  approvalRemarks?: string;
}

export const approveNcr = createAsyncThunk('ncr/approveNcr', async ({ id, approvalRemarks }: ApprovalActionInput) => {
  const result = await apiPatch<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}/approve`, {
    approval_remarks: approvalRemarks,
  });
  return toNcrTicket(result.data);
});

export const rejectNcr = createAsyncThunk('ncr/rejectNcr', async ({ id, approvalRemarks }: ApprovalActionInput) => {
  const result = await apiPatch<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}/reject`, {
    approval_remarks: approvalRemarks,
  });
  return toNcrTicket(result.data);
});

export interface ClosureActionInput {
  id: string;
  closureRemarks: string;
}

export const pmCloseNcr = createAsyncThunk('ncr/pmCloseNcr', async ({ id, closureRemarks }: ClosureActionInput) => {
  const result = await apiPatch<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}/pm-closure`, {
    closure_remarks: closureRemarks,
  });
  return toNcrTicket(result.data);
});

export const qualityCloseNcr = createAsyncThunk(
  'ncr/qualityCloseNcr',
  async ({ id, closureRemarks }: ClosureActionInput) => {
    const result = await apiPatch<{ data: BackendNcrTicket }>(`/ncr-tickets/${id}/quality-closure`, {
      closure_remarks: closureRemarks,
    });
    return toNcrTicket(result.data);
  },
);

export const fetchMaterialRequestDetail = createAsyncThunk(
  'ncr/fetchMaterialRequestDetail',
  async (ncrTicketId: string) => {
    const result = await apiGet<{ data: BackendMaterialRequest }>(
      `/ncr-material-requests/by-ncr/${ncrTicketId}`,
    );
    return toMaterialRequest(result.data, ncrTicketId);
  },
);

// Each Stores-cycle action changes both the material request and the parent
// NCR's status, so it returns both: the updated request from the action's
// response and a fresh copy of the NCR.
interface MaterialActionResult {
  ncr: NcrTicket;
  materialRequest: NcrMaterialRequest;
}

async function afterMaterialAction(
  response: { data: BackendMaterialRequest },
  ncrTicketId: string,
): Promise<MaterialActionResult> {
  const ncr = await apiGet<{ data: BackendNcrTicket }>(`/ncr-tickets/${ncrTicketId}`);
  return { ncr: toNcrTicket(ncr.data), materialRequest: toMaterialRequest(response.data, ncrTicketId) };
}

// Process flow #40 - Stores issues material (one or more rows per line).
export interface IssueMaterialInput {
  materialRequestId: string;
  ncrTicketId: string;
  remarks?: string;
  rows: { detailId: string; quantity: number; serialNo?: string; batchNo?: string }[];
}

export const issueMaterial = createAsyncThunk(
  'ncr/issueMaterial',
  async ({ materialRequestId, ncrTicketId, remarks, rows }: IssueMaterialInput) => {
    const res = await apiPatch<{ data: BackendMaterialRequest }>(`/ncr-material-requests/${materialRequestId}/issue`, {
      remarks,
      items: rows.map((r) => ({
        detail_id: r.detailId,
        quantity: r.quantity,
        serial_no: r.serialNo || undefined,
        batch_no: r.batchNo || undefined,
      })),
    });
    return afterMaterialAction(res, ncrTicketId);
  },
);

// Process flow #42 - technician (or super admin) confirms receipt.
export interface ReceiveMaterialInput {
  materialRequestId: string;
  ncrTicketId: string;
  remarks?: string;
}

export const receiveMaterial = createAsyncThunk(
  'ncr/receiveMaterial',
  async ({ materialRequestId, ncrTicketId, remarks }: ReceiveMaterialInput) => {
    const res = await apiPatch<{ data: BackendMaterialRequest }>(`/ncr-material-requests/${materialRequestId}/receive`, {
      remarks,
    });
    return afterMaterialAction(res, ncrTicketId);
  },
);

// Process flow #43 - return failed item(s) to Stores, with up to 3 photos.
export interface ReturnItemsInput {
  materialRequestId: string;
  ncrTicketId: string;
  items: {
    detailId?: string;
    itemName: string;
    quantity: number;
    serialNo?: string;
    batchNo?: string;
    conditionRemarks?: string;
  }[];
  attachments: File[];
}

export const returnFailedItems = createAsyncThunk(
  'ncr/returnFailedItems',
  async ({ materialRequestId, ncrTicketId, items, attachments }: ReturnItemsInput) => {
    const form = new FormData();
    form.append(
      'items',
      JSON.stringify(
        items.map((i) => ({
          detail_id: i.detailId || undefined,
          item_name: i.itemName,
          quantity: i.quantity,
          serial_no: i.serialNo || undefined,
          batch_no: i.batchNo || undefined,
          condition_remarks: i.conditionRemarks || undefined,
        })),
      ),
    );
    attachments.forEach((file) => form.append('attachments', file));
    const res = await apiPostForm<{ data: BackendMaterialRequest }>(
      `/ncr-material-requests/${materialRequestId}/returns`,
      form,
    );
    return afterMaterialAction(res, ncrTicketId);
  },
);

// Process flow #44 - Stores records the disposition of every returned item.
export interface RecordDispositionInput {
  materialRequestId: string;
  ncrTicketId: string;
  items: { returnId: string; disposition: string; remarks?: string }[];
}

export const recordDisposition = createAsyncThunk(
  'ncr/recordDisposition',
  async ({ materialRequestId, ncrTicketId, items }: RecordDispositionInput) => {
    const res = await apiPatch<{ data: BackendMaterialRequest }>(
      `/ncr-material-requests/${materialRequestId}/returns/disposition`,
      { items: items.map((i) => ({ return_id: i.returnId, disposition: i.disposition, remarks: i.remarks || undefined })) },
    );
    return afterMaterialAction(res, ncrTicketId);
  },
);

export interface ApproveMaterialRequestInput {
  materialRequestId: string;
  ncrTicketId: string;
  remarks?: string;
  materials: { id: string; approvedQty: number }[];
}

export const approveMaterialRequest = createAsyncThunk(
  'ncr/approveMaterialRequest',
  async ({ materialRequestId, ncrTicketId, remarks, materials }: ApproveMaterialRequestInput) => {
    await apiPatch(`/ncr-material-requests/${materialRequestId}/approve`, {
      remarks,
      materials: materials.map((m) => ({ id: m.id, approved_qty: m.approvedQty })),
    });
    // Approval moves the parent NCR to Material_request_approved on the
    // backend; re-fetch it so the list row and open detail dialog show the
    // new status straight away instead of the stale Material_request_Initiated.
    const result = await apiGet<{ data: BackendNcrTicket }>(`/ncr-tickets/${ncrTicketId}`);
    return toNcrTicket(result.data);
  },
);

const ncrSlice = createSlice({
  name: 'ncr',
  initialState,
  reducers: {
    clearNcrDetail(state) {
      state.detail = null;
      state.detailStatus = 'idle';
      state.materialRequest = null;
      state.materialRequestStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    const upsertItem = (state: NcrState, ticket: NcrTicket) => {
      const idx = state.items.findIndex((n) => n.id === ticket.id);
      if (idx !== -1) state.items[idx] = ticket;
      if (state.detail?.id === ticket.id) state.detail = ticket;
    };

    builder
      .addCase(fetchNcrTickets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNcrTickets.fulfilled, (state, action: PayloadAction<NcrTicket[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNcrTickets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load NCR tickets';
      })
      .addCase(fetchNcrDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchNcrDetail.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        state.detailStatus = 'succeeded';
        state.detail = action.payload;
        upsertItem(state, action.payload);
      })
      .addCase(fetchNcrDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.error.message ?? 'Failed to load NCR ticket detail';
      })
      .addCase(raiseNcr.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        state.items = [action.payload, ...state.items.filter((n) => n.id !== action.payload.id)];
      })
      .addCase(createMaterialRequest.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(technicianCloseNcr.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(submitQualityReview.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(approveNcr.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(rejectNcr.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(pmCloseNcr.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(qualityCloseNcr.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(approveMaterialRequest.fulfilled, (state, action: PayloadAction<NcrTicket>) => {
        upsertItem(state, action.payload);
      })
      .addCase(fetchMaterialRequestDetail.pending, (state) => {
        state.materialRequestStatus = 'loading';
      })
      .addCase(fetchMaterialRequestDetail.fulfilled, (state, action: PayloadAction<NcrMaterialRequest>) => {
        state.materialRequestStatus = 'succeeded';
        state.materialRequest = action.payload;
      })
      .addCase(fetchMaterialRequestDetail.rejected, (state, action) => {
        state.materialRequestStatus = 'failed';
        state.error = action.error.message ?? 'Failed to load material request detail';
      })
      .addMatcher(
        isAnyOf(issueMaterial.fulfilled, receiveMaterial.fulfilled, returnFailedItems.fulfilled, recordDisposition.fulfilled),
        (state, action: PayloadAction<MaterialActionResult>) => {
          upsertItem(state, action.payload.ncr);
          state.materialRequest = action.payload.materialRequest;
          state.materialRequestStatus = 'succeeded';
        },
      );
  },
});

export const { clearNcrDetail } = ncrSlice.actions;
export default ncrSlice.reducer;
