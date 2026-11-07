import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { approveMaterialRequest, fetchMaterialRequestDetail } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

interface MaterialRequestApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketId: string;
}

export default function MaterialRequestApprovalDialog({ open, onClose, ncrTicketId }: MaterialRequestApprovalDialogProps) {
  const dispatch = useAppDispatch();
  const { materialRequest, materialRequestStatus } = useAppSelector((s) => s.ncr);
  const [approvedQty, setApprovedQty] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && ncrTicketId) {
      dispatch(fetchMaterialRequestDetail(ncrTicketId));
      setRemarks('');
    }
  }, [open, ncrTicketId, dispatch]);

  useEffect(() => {
    if (materialRequest) {
      const initial: Record<string, string> = {};
      materialRequest.details.forEach((d) => {
        initial[d.id] = String(d.approvedQty ?? d.materialQty);
      });
      setApprovedQty(initial);
    }
  }, [materialRequest]);

  const handleApprove = async () => {
    if (!materialRequest) return;
    setSubmitting(true);
    const result = await dispatch(
      approveMaterialRequest({
        materialRequestId: materialRequest.id,
        ncrTicketId,
        remarks: remarks.trim() || undefined,
        materials: materialRequest.details.map((d) => ({
          id: d.id,
          approvedQty: Number(approvedQty[d.id] ?? d.materialQty),
        })),
      }),
    );
    setSubmitting(false);
    if (approveMaterialRequest.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Material request approved', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: 'Failed to approve material request', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Material Request Details
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {materialRequestStatus === 'loading' && (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        )}
        {materialRequestStatus === 'succeeded' && materialRequest && materialRequest.details.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No material line items found.
          </Typography>
        )}
        {materialRequest && materialRequest.details.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Material Name</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Approved Qty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materialRequest.details.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.materialName}</TableCell>
                  <TableCell align="right">{d.materialQty}</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={approvedQty[d.id] ?? ''}
                      onChange={(e) => setApprovedQty((prev) => ({ ...prev, [d.id]: e.target.value }))}
                      sx={{ width: 100 }}
                      slotProps={{ htmlInput: { min: 0 } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TextField
          label="Remarks (optional)"
          fullWidth
          multiline
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 3 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleApprove}
          disabled={submitting || !materialRequest || materialRequest.details.length === 0}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
