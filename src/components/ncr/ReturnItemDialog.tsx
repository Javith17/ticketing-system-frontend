import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
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
import { returnFailedItems } from '../../redux/slices/ncrSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import type { NcrMaterialRequest } from '../../types';
import PhotoPicker from './PhotoPicker';

interface ReturnItemDialogProps {
  open: boolean;
  onClose: () => void;
  ncrTicketNo: string;
  materialRequest: NcrMaterialRequest | null;
}

interface ReturnLine {
  detailId?: string;
  itemName: string;
  quantity: number;
  serialNo?: string;
  batchNo?: string;
  conditionRemarks?: string;
}

const OTHER = '__other__';

/**
 * Return failed item(s) to Stores - process flow step #43, done here by the
 * super admin. Each item can be linked to an issued line (it's the part that
 * line replaced) or entered as another component.
 */
export default function ReturnItemDialog({ open, onClose, ncrTicketNo, materialRequest }: ReturnItemDialogProps) {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<ReturnLine[]>([]);
  const [lineId, setLineId] = useState(OTHER);
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('1');
  const [serialNo, setSerialNo] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [condition, setCondition] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setLineId(OTHER);
    setItemName('');
    setQty('1');
    setSerialNo('');
    setBatchNo('');
    setCondition('');
  };

  useEffect(() => {
    if (open) {
      setItems([]);
      setFiles([]);
      setError(undefined);
      resetForm();
    }
  }, [open]);

  const handleLineChange = (value: string) => {
    setLineId(value);
    const line = materialRequest?.details.find((d) => d.id === value);
    if (line) setItemName(line.materialName);
  };

  const addItem = () => {
    const quantity = Number(qty);
    if (!itemName.trim() || !Number.isFinite(quantity) || quantity <= 0) {
      setError('Enter the item name and a quantity greater than 0');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        detailId: lineId === OTHER ? undefined : lineId,
        itemName: itemName.trim(),
        quantity,
        serialNo: serialNo.trim() || undefined,
        batchNo: batchNo.trim() || undefined,
        conditionRemarks: condition.trim() || undefined,
      },
    ]);
    setError(undefined);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!materialRequest || items.length === 0) return;
    setSubmitting(true);
    const result = await dispatch(
      returnFailedItems({
        materialRequestId: materialRequest.id,
        ncrTicketId: materialRequest.ncrTicketId,
        items,
        attachments: files,
      }),
    );
    setSubmitting(false);
    if (returnFailedItems.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: 'Failed item returned to Stores', severity: 'success' }));
      onClose();
    } else {
      dispatch(showSnackbar({ message: result.error.message || 'Failed to return items', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Return failed item — {ncrTicketNo}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {items.length > 0 && (
          <Table size="small" sx={{ mb: 2.5 }}>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell>Serial no.</TableCell>
                <TableCell>Batch no.</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it, i) => (
                <TableRow key={`${it.itemName}-${i}`}>
                  <TableCell>{it.itemName}</TableCell>
                  <TableCell align="right">{it.quantity}</TableCell>
                  <TableCell>{it.serialNo || '-'}</TableCell>
                  <TableCell>{it.batchNo || '-'}</TableCell>
                  <TableCell>{it.conditionRemarks || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label={`Remove ${it.itemName}`}
                      onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Typography variant="caption" sx={{ display: 'block', mb: 1.5, fontWeight: 700, color: 'text.secondary' }}>
          {items.length ? 'ADD ANOTHER ITEM' : 'FAILED ITEM'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <TextField
            select
            size="small"
            label="Replaced by issued line"
            value={lineId}
            onChange={(e) => handleLineChange(e.target.value)}
          >
            <MenuItem value={OTHER}>Other component</MenuItem>
            {materialRequest?.details.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.materialName}
              </MenuItem>
            ))}
          </TextField>
          <TextField size="small" label="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          <TextField
            size="small"
            label="Qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />
          <TextField size="small" label="Serial no." value={serialNo} onChange={(e) => setSerialNo(e.target.value)} />
          <TextField size="small" label="Batch no." value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
          <TextField
            size="small"
            label="Condition / failure"
            placeholder="e.g. coil burnt"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </Box>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 1.5 }}>
          Add item
        </Button>
        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <PhotoPicker files={files} onChange={setFiles} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || items.length === 0}>
          Return to Stores
        </Button>
      </DialogActions>
    </Dialog>
  );
}
