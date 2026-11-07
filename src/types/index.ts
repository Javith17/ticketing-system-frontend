export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Closed'
  | 'Under Review'
  | 'Assigned RSM'
  | 'Assigned Technician'
  | 'Started'
  | 'Closure Approval'
  | 'Ticket Closed';
export type Designation = 'JE' | 'AE' | 'ADE' | 'DE' | 'SE' | 'CE';
export type TicketSource = 'EMS' | 'CCMS' | 'Feeder Pillar' | 'Mobile App' | 'Phone Call' | 'Email';
export type ReporterType =
  | 'Public'
  | 'Foreman'
  | 'JE'
  | 'AE'
  | 'ADE'
  | 'DE'
  | 'SE'
  | 'CE'
  | 'Commissioner'
  | 'IAS Officer'
  | 'Service Person'
  | 'Field Support';

export interface User {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: Designation | '';
  email: string;
  roleId: string;
  roleName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface ReturnRemark {
  returnBy?: string;
  remarks: string;
  returnedAt: string;
}

export interface Ticket {
  id: string;
  complaintId: string;
  source: TicketSource;
  // Legacy, pre-migration tickets only - new tickets are created against a
  // Pole (via Location -> Section -> Pole), not an Asset.
  assetId?: string;
  asset?: string;
  locationId?: number;
  locationName?: string;
  sectionId?: number;
  sectionName?: string;
  poleId?: number;
  poleName?: string;
  latitude?: number;
  longitude?: number;
  severity: Severity;
  status: TicketStatus;
  title: string;
  description: string;
  assignedUser: string;
  assignedTo?: string;
  assignedRsm?: string;
  returnRemarks?: ReturnRemark[];
  createdAt: string;
}

export interface TicketHistoryEntry {
  id: string;
  eventAt: string;
  eventType: string;
  eventUser?: string;
  eventUserName?: string;
  eventDetail: string;
}

export interface TicketDetailEntry {
  id: string;
  event: string;
  eventBy?: string;
  eventByName?: string;
  eventAt: string;
  remarks?: string;
  testValues?: string;
  attachments: string[];
}

export interface Category {
  id: string;
  categoryCode: string;
  name: string;
  description?: string;
  ticketCount: number;
}

export interface Asset {
  id: string;
  name: string;
  panel: string;
  site?: string;
  location?: string;
  coordinates?: string;
  description?: string;
  barcode?: string;
}

export type NcrStatus =
  | 'In-Review'
  | 'Approved'
  | 'Rejected'
  | 'Material_request_Initiated'
  | 'Material_request_approved'
  | 'Material_issued'
  | 'Material_received'
  | 'Item_returned'
  | 'Return_dispositioned'
  | 'Technician Closed'
  | 'PM Closed'
  | 'Closed';

export interface NcrLinkedTicket {
  ticketId: string;
  ticketNo: string;
}

export interface NcrReviewDetail {
  reviewType: string;
  reviewedBy: string;
  reviewedByName: string | null;
  reviewedAt: string;
  reviewRemarks: string;
}

export interface NcrApprovalDetail {
  approvalType: string;
  approvedBy: string;
  approvedByName: string | null;
  approvedAt: string;
  approvalRemarks: string;
}

export interface NcrClosureDetail {
  closureType: string;
  closureRemarks: string;
  closureBy: string;
  closureByName: string | null;
  closureAt: string;
  closureAttachments: string[];
}

export interface NcrTicket {
  id: string;
  ticketNo: string;
  description: string;
  status: NcrStatus;
  linkedTickets: NcrLinkedTicket[];
  reviewDetail: NcrReviewDetail[];
  approvalDetails: NcrApprovalDetail[];
  closureDetails: NcrClosureDetail[];
  raisedBy?: string;
  raisedByName: string | null;
  createdBy?: string;
  createdByName: string | null;
  createdAt: string;
}

export interface NcrMaterialIssueRow {
  id: string;
  quantity: number;
  serialNo: string | null;
  batchNo: string | null;
}

export interface NcrMaterialRequestItem {
  id: string;
  materialName: string;
  materialQty: number;
  approvedQty: number | null;
  issuedQty: number | null;
  issues: NcrMaterialIssueRow[];
}

export const NCR_RETURN_DISPOSITIONS = [
  'Scrap',
  'Repair & reuse',
  'Return to vendor / warranty claim',
  'Quarantine for Quality',
] as const;

export interface NcrMaterialReturn {
  id: string;
  detailId: string | null;
  itemName: string;
  quantity: number;
  serialNo: string | null;
  batchNo: string | null;
  conditionRemarks: string | null;
  attachments: string[];
  returnedByName: string | null;
  returnedAt: string | null;
  disposition: string | null;
  dispositionRemarks: string | null;
  dispositionByName: string | null;
  dispositionAt: string | null;
}

// Material request status: Initiated -> Approved -> Issued -> Received ->
// Returned -> Dispositioned (process flow steps #37-#44).
export interface NcrMaterialRequest {
  id: string;
  ncrTicketId: string;
  remarks?: string;
  status: string;
  details: NcrMaterialRequestItem[];
  issueRemarks: string | null;
  issuedByName: string | null;
  issuedAt: string | null;
  receiptRemarks: string | null;
  receivedByName: string | null;
  receivedAt: string | null;
  returns: NcrMaterialReturn[];
}

export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
  roleCode?: string;
  displayName: string;
}

export interface Feature {
  id: string;
  feature: string;
  isApproval: boolean;
}

export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  features: string[];
  approvals: string[];
}

export interface Source {
  id: string;
  sourceName: string;
  description?: string;
}

export interface Location {
  id: number;
  name: string;
  associateName?: string;
  remarks?: string;
  wapGroupName?: string;
}

export interface Section {
  id: number;
  name: string;
  displayName?: string | null;
  locationName?: string;
  associateName?: string;
  remarks?: string;
  wapGroupId?: string | null;
}

export interface Pole {
  id: number;
  poleNumber: string;
  sectionName?: string;
  locationName?: string;
  associateName?: string;
  latitude?: number;
  longitude?: number;
  meterId?: number;
  installedDate?: string | null;
}
