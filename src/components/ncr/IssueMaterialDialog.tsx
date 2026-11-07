import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch } from '../../redux/hooks';
import { issueMaterial } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import type { NcrMaterialRequest } from '../../types';

interface IssueMaterialDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketNo: string;
  materialRequest: NcrMaterialRequest | null;
}

interface Row {
  key: number;
  quantity: string;
  serialNo: string;
  batchNo: string;
}

let rowKey = 0;
const newRow = (quantity = ''): Row => ({ key: ++rowKey, quantity, serialNo: '', batchNo: '' });

/**
 * Stores (or super admin) issues an approved material request - process
 * flow step #40. Each approved line gets one or more rows of qty + serial
 * no. + batch no. (e.g. 2 serialised units = 2 rows of qty 1, or a single
 * batch row). Issuing less than approved is allowed (stock shortage), more
 * is not. This is the only issue event for the request.
 */
export default function IssueMaterialDialog({ open, onClose, ncrTicketNo, materialRequest }: IssueMaterialDialogProps) {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Record<string, Row[]>>({});
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && materialRequest) {
      const initial: Record<string, Row[]> = {};
      materialRequest.details.forEach((d) => {
        initial[d.id] = [newRow(String(d.approvedQty ?? d.materialQty))];
      });
      setRows(initial);
      setRemarks('');
      setError(undefined);
    }
  }, [open, materialRequest]);

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    Object.entries(rows).forEach(([id, list]) => {
      t[id] = list.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    });
    return t;
  }, [rows]);

  const updateRow = (detailId: string, key: number, patch: Partial<Row>) => {
    setRows((prev) => ({ ...prev, [detailId]: prev[detailId].map((r) => (r.key === key ? { ...r, ...patch } : r)) }));
    setError(undefined);
  };

  const handleSubmit = async () => {
    if (!materialRequest) return;
    const payload: { detailId: string; quantity: number; serialNo?: string; batchNo?: string }[] = [];
    for (const d of materialRequest.details) {
      const approved = d.approvedQty ?? d.materialQty;
      for (const r of rows[d.id] ?? []) {
        if (!r.quantity.trim() && !r.serialNo.trim() && !r.batchNo.trim()) continue; // blank row
        const qty = Number(r.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          setError(`Enter a quantity greater than 0 for every row of '${d.materialName}'`);
          return;
        }
        payload.push({ detailId: d.id, quantity: qty, serialNo: r.serialNo.trim(), batchNo: r.batchNo.trim() });
      }
      if ((totals[d.id] ?? 0) > approved + 1e-9) {
        setError(`'${d.materialName}': issuing ${totals[d.id]} but only ${approved} approved`);
        return;
      }
    }
    if (payload.length === 0) {
      setError('Enter at least one quantity to issue');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      issueMaterial({
        materialRequestId: materialRequest.id,
        ncrTicketId: materialRequest.ncrTicketId,
        remarks: remarks.trim() || undefined,
        rows: payload,
      }),
    );
    setSubmitting(false);
    if (issueMaterial.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Material issued', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to issue material', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Issue material — {ncrTicketNo}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {!materialRequest && (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        )}
        {materialRequest?.details.map((d, idx) => {
          const approved = d.approvedQty ?? d.materialQty;
          const issuing = totals[d.id] ?? 0;
          const over = issuing > approved + 1e-9;
          return (
            <Box key={d.id}>
              {idx > 0 && <Divider sx={{ my: 2 }} />}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {d.materialName}
                </Typography>
                <Typography variant="caption" color={over ? 'error' : 'text.secondary'}>
                  Approved {approved} · Issuing {issuing}
                  {issuing < approved && !over ? ' (short)' : ''}
                </Typography>
              </Box>
              {(rows[d.id] ?? []).map((r) => (
                <Box key={r.key} sx={{ display: 'flex', gap: 1.25, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    label="Qty"
                    type="number"
                    value={r.quantity}
                    onChange={(e) => updateRow(d.id, r.key, { quantity: e.target.value })}
                    slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    size="small"
                    label="Serial no."
                    value={r.serialNo}
                    onChange={(e) => updateRow(d.id, r.key, { serialNo: e.target.value })}
                    sx={{ flex: 1, minWidth: 160 }}
                  />
                  <TextField
                    size="small"
                    label="Batch no."
                    value={r.batchNo}
                    onChange={(e) => updateRow(d.id, r.key, { batchNo: e.target.value })}
                    sx={{ flex: 1, minWidth: 160 }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Remove row"
                    disabled={(rows[d.id] ?? []).length <= 1}
                    onClick={() => setRows((prev) => ({ ...prev, [d.id]: prev[d.id].filter((x) => x.key !== r.key) }))}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setRows((prev) => ({ ...prev, [d.id]: [...(prev[d.id] ?? []), newRow()] }))}
              >
                Add serial / batch row
              </Button>
            </Box>
          );
        })}

        <TextField
          label="Remarks (optional)"
          placeholder="e.g. short-issued due to stock"
          fullWidth
          multiline
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 3 }}
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !materialRequest}>
          Issue Material
        </Button>
      </DialogActions>
    </Dialog>
  );
}
