import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Grid,
  Typography,
  Divider,
  TextField,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { NcrTicket } from '../../types';
import NcrStatusChip from './NcrStatusChip';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  approveNcr,
  fetchMaterialRequestDetail,
  fetchNcrDetail,
  pmCloseNcr,
  qualityCloseNcr,
  rejectNcr,
  submitQualityReview,
} from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { useRoleCode } from '../../hooks/useRoleCode';
import { required } from '../../utils/validators';
import MaterialRequestApprovalDialog from './MaterialRequestApprovalDialog';
import MaterialRequestFormDialog from './MaterialRequestFormDialog';
import TechnicianClosureDialog from './TechnicianClosureDialog';
import IssueMaterialDialog from './IssueMaterialDialog';
import ConfirmReceiptDialog from './ConfirmReceiptDialog';
import ReturnItemDialog from './ReturnItemDialog';
import DispositionDialog from './DispositionDialog';
import NcrMaterialSection from './NcrMaterialSection';
import type { NcrStatus } from '../../types';

// Statuses at which the NCR has a material request worth showing.
const MATERIAL_STATUSES: NcrStatus[] = [
  'Material_request_Initiated',
  'Material_request_approved',
  'Material_issued',
  'Material_received',
  'Item_returned',
  'Return_dispositioned',
  'Technician Closed',
  'PM Closed',
  'Closed',
];

interface NcrDetailDialogProps {
  open: boolean;
  onClose: () => void;
  ticket: NcrTicket | null;
}

const kvLabel = {
  variant: 'caption',
  color: 'text.secondary',
  sx: { textTransform: 'uppercase', fontWeight: 600, letterSpacing: '.04em' },
} as const;

const sectionLabel = {
  variant: 'caption',
  sx: { display: 'block', mt: 3, mb: 1.5, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.06em', color: 'text.secondary' },
} as const;

export default function NcrDetailDialog({ open, onClose, ticket: ticketProp }: NcrDetailDialogProps) {
  const dispatch = useAppDispatch();
  const roleCode = useRoleCode();
  const detail = useAppSelector((s) => s.ncr.detail);
  const storedMaterialRequest = useAppSelector((s) => s.ncr.materialRequest);
  const ticket = detail && ticketProp && detail.id === ticketProp.id ? detail : ticketProp;

  const [submitting, setSubmitting] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewError, setReviewError] = useState<string | undefined>();
  const [closureRemarks, setClosureRemarks] = useState('');
  const [closureError, setClosureError] = useState<string | undefined>();
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [technicianClosureOpen, setTechnicianClosureOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [dispositionOpen, setDispositionOpen] = useState(false);

  useEffect(() => {
    if (open && ticketProp) {
      dispatch(fetchNcrDetail(ticketProp.id));
    }
    if (open) {
      setReviewRemarks('');
      setReviewError(undefined);
      setClosureRemarks('');
      setClosureError(undefined);
      setApprovalAction(null);
      setApprovalRemarks('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticketProp?.id, dispatch]);

  const hasMaterialStage = Boolean(ticket && MATERIAL_STATUSES.includes(ticket.status));
  useEffect(() => {
    if (open && ticket && hasMaterialStage) {
      dispatch(fetchMaterialRequestDetail(ticket.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // ticket.status is a dependency so the section reloads after any step
    // that moves the NCR on (e.g. Production approving the request).
  }, [open, ticket?.id, ticket?.status, hasMaterialStage, dispatch]);

  if (!ticket) return null;

  // Only use the stored material request if it belongs to this NCR.
  const materialRequest =
    storedMaterialRequest && storedMaterialRequest.ncrTicketId === ticket.id ? storedMaterialRequest : null;
  const isAdmin = roleCode === 'ADMIN';
  const isStoresOrAdmin = roleCode === 'STORES' || isAdmin;

  const handleSubmitReview = async () => {
    const err = required(reviewRemarks, 'Review remarks');
    setReviewError(err);
    if (err) return;
    setSubmitting(true);
    const result = await dispatch(submitQualityReview({ id: ticket.id, reviewRemarks }));
    setSubmitting(false);
    if (submitQualityReview.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Quality review submitted', severity: 'success' }));
      setReviewRemarks('');
    } else {
      dispatch(showSnackbar({ message: 'Failed to submit quality review', severity: 'error' }));
    }
  };

  const handleApprovalConfirm = async () => {
    if (!approvalAction) return;
    setSubmitting(true);
    const thunk = approvalAction === 'approve' ? approveNcr : rejectNcr;
    const result = await dispatch(thunk({ id: ticket.id, approvalRemarks: approvalRemarks.trim() || undefined }));
    setSubmitting(false);
    if (thunk.fulfilled.match(result)) {
      dispatch(
        showSnackbar({ message: approvalAction === 'approve' ? 'NCR approved' : 'NCR rejected', severity: 'success' }),
      );
      setApprovalAction(null);
      setApprovalRemarks('');
    } else {
      dispatch(showSnackbar({ message: `Failed to ${approvalAction} NCR`, severity: 'error' }));
    }
  };

  const handleClosure = async () => {
    const err = required(closureRemarks, 'Closing remarks');
    setClosureError(err);
    if (err) return;
    setSubmitting(true);
    const thunk = ticket.status === 'Technician Closed' ? pmCloseNcr : qualityCloseNcr;
    const result = await dispatch(thunk({ id: ticket.id, closureRemarks }));
    setSubmitting(false);
    if (thunk.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'NCR ticket closed', severity: 'success' }));
      setClosureRemarks('');
    } else {
      dispatch(showSnackbar({ message: 'Failed to close NCR ticket', severity: 'error' }));
    }
  };

  const kv = [
    { k: 'Ticket No', v: ticket.ticketNo },
    { k: 'Raised by', v: ticket.raisedByName || '-' },
    // Shown only when a super admin raised the NCR on the technician's behalf.
    ...(ticket.createdBy && ticket.createdBy !== ticket.raisedBy
      ? [{ k: 'Raised on behalf by', v: ticket.createdByName || '-' }]
      : []),
    { k: 'Created', v: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-' },
  ];

  const renderActions = () => {
    // Super admin can do both the Quality review and the PM_DH decision.
    if (isAdmin && ticket.status === 'In-Review') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="outlined" onClick={handleSubmitReview} disabled={submitting}>
            Submit Review
          </Button>
          <Button variant="outlined" color="error" onClick={() => setApprovalAction('reject')} disabled={submitting}>
            Reject
          </Button>
          <Button variant="contained" onClick={() => setApprovalAction('approve')} disabled={submitting}>
            Approve
          </Button>
        </>
      );
    }

    if (roleCode === 'QUALITY' && ticket.status === 'In-Review') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitReview} disabled={submitting}>
            Submit Review
          </Button>
        </>
      );
    }

    if (roleCode === 'PM_DH' && ticket.status === 'In-Review') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={() => setApprovalAction('reject')} disabled={submitting}>
            Reject
          </Button>
          <Button variant="contained" onClick={() => setApprovalAction('approve')} disabled={submitting}>
            Approve
          </Button>
        </>
      );
    }

    // Super admin performs the technician's steps from the web app.
    if (roleCode === 'ADMIN' && ticket.status === 'Approved') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setMaterialFormOpen(true)}>
            Generate Material Request
          </Button>
        </>
      );
    }

    // Stores cycle (process flow #39-#44). Stores issues and dispositions;
    // the super admin can also act as Stores and as the technician.
    if (isStoresOrAdmin && ticket.status === 'Material_request_approved') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setIssueOpen(true)} disabled={!materialRequest}>
            Issue Material
          </Button>
        </>
      );
    }

    if (isAdmin && ticket.status === 'Material_issued') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setReceiptOpen(true)} disabled={!materialRequest}>
            Confirm Receipt
          </Button>
        </>
      );
    }

    if (isAdmin && ticket.status === 'Material_received') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => setReturnOpen(true)} disabled={!materialRequest}>
            Return Failed Item
          </Button>
          <Button variant="contained" onClick={() => setTechnicianClosureOpen(true)}>
            Submit Closure
          </Button>
        </>
      );
    }

    if (isStoresOrAdmin && ticket.status === 'Item_returned') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setDispositionOpen(true)} disabled={!materialRequest}>
            Record Disposition
          </Button>
        </>
      );
    }

    if (isAdmin && ticket.status === 'Return_dispositioned') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setTechnicianClosureOpen(true)}>
            Submit Closure
          </Button>
        </>
      );
    }

    // Production Head approves the material request; the super admin can too.
    if ((roleCode === 'PROD_HEAD' || isAdmin) && ticket.status === 'Material_request_Initiated') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setMaterialDialogOpen(true)}>
            View Material Request Details
          </Button>
        </>
      );
    }

    if (roleCode === 'PM_DH' && ticket.status === 'Technician Closed') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleClosure} disabled={submitting}>
            Close
          </Button>
        </>
      );
    }

    if (roleCode === 'QUALITY' && ticket.status === 'PM Closed') {
      return (
        <>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleClosure} disabled={submitting}>
            Close
          </Button>
        </>
      );
    }

    return (
      <Button onClick={onClose} color="inherit">
        Close
      </Button>
    );
  };

  const showReviewField = (roleCode === 'QUALITY' || isAdmin) && ticket.status === 'In-Review';
  const showClosureField =
    (roleCode === 'PM_DH' && ticket.status === 'Technician Closed') ||
    (roleCode === 'QUALITY' && ticket.status === 'PM Closed');

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {ticket.ticketNo}
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {kv.map((item) => (
              <Grid key={item.k} size={{ xs: 12, sm: 6 }}>
                <Typography {...kvLabel}>{item.k}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {item.v}
                </Typography>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography {...kvLabel}>Status</Typography>
              <Box sx={{ mt: 0.5 }}>
                <NcrStatusChip status={ticket.status} />
              </Box>
            </Grid>
            <Grid size={12}>
              <Typography {...kvLabel}>Description</Typography>
              <Typography variant="body2">{ticket.description}</Typography>
            </Grid>
            {ticket.linkedTickets.length > 0 && (
              <Grid size={12}>
                <Typography {...kvLabel}>Linked tickets</Typography>
                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {ticket.linkedTickets.map((t) => (
                    <Chip key={t.ticketId} label={t.ticketNo} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          {showReviewField && (
            <TextField
              label="Review remarks"
              placeholder="Add quality review remarks"
              fullWidth
              multiline
              rows={3}
              value={reviewRemarks}
              onChange={(e) => {
                setReviewRemarks(e.target.value);
                setReviewError(undefined);
              }}
              error={Boolean(reviewError)}
              helperText={
                reviewError ?? (isAdmin ? 'Used by Submit Review. Approve / Reject ask for their own remarks.' : undefined)
              }
              sx={{ mt: 3 }}
            />
          )}

          {showClosureField && (
            <TextField
              label="Closing remarks"
              placeholder="Add closing remarks"
              fullWidth
              multiline
              rows={3}
              value={closureRemarks}
              onChange={(e) => {
                setClosureRemarks(e.target.value);
                setClosureError(undefined);
              }}
              error={Boolean(closureError)}
              helperText={closureError}
              sx={{ mt: 3 }}
            />
          )}

          {materialRequest && (
            <>
              <Typography {...sectionLabel}>Material</Typography>
              <NcrMaterialSection request={materialRequest} />
            </>
          )}

          {ticket.reviewDetail.length > 0 && (
            <>
              <Typography {...sectionLabel}>Quality review</Typography>
              <Box sx={{ pl: 1 }}>
                {ticket.reviewDetail.map((r, i) => (
                  <TimelineRow
                    key={i}
                    title={r.reviewedByName || r.reviewType}
                    meta={r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : ''}
                    remark={r.reviewRemarks}
                    isLast={i === ticket.reviewDetail.length - 1}
                  />
                ))}
              </Box>
            </>
          )}

          {ticket.approvalDetails.length > 0 && (
            <>
              <Typography {...sectionLabel}>Approvals</Typography>
              <Box sx={{ pl: 1 }}>
                {ticket.approvalDetails.map((a, i) => (
                  <TimelineRow
                    key={i}
                    title={`${a.approvedByName || 'Approver'} — ${a.approvalType}`}
                    meta={a.approvedAt ? new Date(a.approvedAt).toLocaleString() : ''}
                    remark={a.approvalRemarks}
                    isLast={i === ticket.approvalDetails.length - 1}
                  />
                ))}
              </Box>
            </>
          )}

          {ticket.closureDetails.length > 0 && (
            <>
              <Typography {...sectionLabel}>Closures</Typography>
              <Box sx={{ pl: 1 }}>
                {ticket.closureDetails.map((c, i) => (
                  <TimelineRow
                    key={i}
                    title={`${c.closureByName || 'User'} — ${c.closureType}`}
                    meta={c.closureAt ? new Date(c.closureAt).toLocaleString() : ''}
                    remark={c.closureRemarks}
                    isLast={i === ticket.closureDetails.length - 1}
                  />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>{renderActions()}</DialogActions>
      </Dialog>

      <Dialog open={Boolean(approvalAction)} onClose={() => setApprovalAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {approvalAction === 'approve' ? 'Approve NCR' : 'Reject NCR'}
          <IconButton onClick={() => setApprovalAction(null)} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Remarks (optional)"
            fullWidth
            multiline
            rows={3}
            value={approvalRemarks}
            onChange={(e) => setApprovalRemarks(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApprovalAction(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color={approvalAction === 'reject' ? 'error' : 'primary'}
            onClick={handleApprovalConfirm}
            disabled={submitting}
          >
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      <MaterialRequestApprovalDialog
        open={materialDialogOpen}
        onClose={() => setMaterialDialogOpen(false)}
        ncrTicketId={ticket.id}
      />

      <MaterialRequestFormDialog
        open={materialFormOpen}
        onClose={() => setMaterialFormOpen(false)}
        ncrTicketId={ticket.id}
        ncrTicketNo={ticket.ticketNo}
      />

      <TechnicianClosureDialog
        open={technicianClosureOpen}
        onClose={() => setTechnicianClosureOpen(false)}
        ncrTicketId={ticket.id}
        ncrTicketNo={ticket.ticketNo}
        withoutReturn={ticket.status === 'Material_received'}
      />

      <IssueMaterialDialog
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        ncrTicketNo={ticket.ticketNo}
        materialRequest={materialRequest}
      />

      <ConfirmReceiptDialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        ncrTicketNo={ticket.ticketNo}
        materialRequest={materialRequest}
      />

      <ReturnItemDialog
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        ncrTicketNo={ticket.ticketNo}
        materialRequest={materialRequest}
      />

      <DispositionDialog
        open={dispositionOpen}
        onClose={() => setDispositionOpen(false)}
        ncrTicketNo={ticket.ticketNo}
        materialRequest={materialRequest}
      />
    </>
  );
}

function TimelineRow({ title, meta, remark, isLast }: { title: string; meta: string; remark: string; isLast: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, pb: isLast ? 0 : 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FiberManualRecordIcon sx={{ fontSize: 14, color: 'primary.main' }} />
        {!isLast && <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {meta && (
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {meta}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {remark}
        </Typography>
      </Box>
    </Box>
  );
}
