import { useEffect, useState } from 'react';
import {
  Box,
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
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch } from '../../redux/hooks';
import { createMaterialRequest } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

interface MaterialRequestFormDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketId: string;
  ncrTicketNo: string;
}

interface Line {
  materialName: string;
  materialQty: number;
}

/**
 * Web equivalent of the field ops app's "Generate Material Request" form,
 * used by the super admin on an Approved NCR: add material lines (name +
 * qty), optional remarks, then submit the whole batch.
 */
export default function MaterialRequestFormDialog({
  open,
  onClose,
  ncrTicketId,
  ncrTicketNo,
}: MaterialRequestFormDialogProps) {
  const dispatch = useAppDispatch();
  const [lines, setLines] = useState<Line[]>([]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [lineError, setLineError] = useState<string | undefined>();
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLines([]);
      setName('');
      setQty('');
      setLineError(undefined);
      setRemarks('');
    }
  }, [open]);

  const addLine = () => {
    const parsedQty = Number(qty);
    if (!name.trim() || !qty.trim() || !Number.isFinite(parsedQty) || parsedQty <= 0) {
      setLineError('Enter a material name and a quantity greater than 0');
      return;
    }
    setLines((prev) => [...prev, { materialName: name.trim(), materialQty: parsedQty }]);
    setName('');
    setQty('');
    setLineError(undefined);
  };

  const handleSubmit = async () => {
    if (lines.length === 0) return;
    setSubmitting(true);
    const result = await dispatch(
      createMaterialRequest({ ncrTicketId, remarks: remarks.trim() || undefined, materials: lines }),
    );
    setSubmitting(false);
    if (createMaterialRequest.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Material request submitted', severity: 'success' }));
      onClose();
    } else {
      dispatch(
        showSnackbar({ message: result.error.message || 'Failed to submit material request', severity: 'error' }),
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Material request — {ncrTicketNo}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {lines.length > 0 ? (
          <Table size="small" sx={{ mb: 2.5 }}>
            <TableHead>
              <TableRow>
                <TableCell>Material Name</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, i) => (
                <TableRow key={`${line.materialName}-${i}`}>
                  <TableCell>{line.materialName}</TableCell>
                  <TableCell align="right">{line.materialQty}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label={`Remove ${line.materialName}`}
                      onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No materials added yet.
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Material name"
            placeholder="e.g. Contactor 40A"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setLineError(undefined);
            }}
            onKeyDown={(e) => e.key === 'Enter' && addLine()}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            size="small"
            label="Qty"
            type="number"
            value={qty}
            onChange={(e) => {
              setQty(e.target.value);
              setLineError(undefined);
            }}
            onKeyDown={(e) => e.key === 'Enter' && addLine()}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            sx={{ width: 110 }}
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addLine} sx={{ height: 40 }}>
            Add
          </Button>
        </Box>
        {lineError && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
            {lineError}
          </Typography>
        )}

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
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || lines.length === 0}>
          Submit Material Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}
