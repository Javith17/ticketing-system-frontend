import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../redux/hooks';
import { receiveMaterial } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import type { NcrMaterialRequest } from '../../types';

interface ConfirmReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketNo: string;
  materialRequest: NcrMaterialRequest | null;
}

/** Technician's receipt of the issued material (process flow step #42), done here by the super admin. */
export default function ConfirmReceiptDialog({ open, onClose, ncrTicketNo, materialRequest }: ConfirmReceiptDialogProps) {
  const dispatch = useAppDispatch();
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setRemarks('');
  }, [open]);

  const issuedRows =
    materialRequest?.details.flatMap((d) =>
      d.issues.length ? d.issues.map((i) => ({ ...i, materialName: d.materialName })) : [],
    ) ?? [];

  const handleConfirm = async () => {
    if (!materialRequest) return;
    setSubmitting(true);
    const result = await dispatch(
      receiveMaterial({
        materialRequestId: materialRequest.id,
        ncrTicketId: materialRequest.ncrTicketId,
        remarks: remarks.trim() || undefined,
      }),
    );
    setSubmitting(false);
    if (receiveMaterial.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Receipt confirmed', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to confirm receipt', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Confirm receipt — {ncrTicketNo}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell>Serial no.</TableCell>
              <TableCell>Batch no.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issuedRows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.materialName}</TableCell>
                <TableCell align="right">{r.quantity}</TableCell>
                <TableCell>{r.serialNo || '-'}</TableCell>
                <TableCell>{r.batchNo || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TextField
          label="Remarks (optional)"
          fullWidth
          multiline
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 3 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={submitting || !materialRequest}>
          Confirm Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
