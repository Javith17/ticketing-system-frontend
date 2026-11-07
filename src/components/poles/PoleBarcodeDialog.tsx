import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Pole } from '../../types';
import PoleBarcode from './PoleBarcode';

interface PoleBarcodeDialogProps {
  open: boolean;
  onClose: () => void;
  pole: Pole | null;
}

export default function PoleBarcodeDialog({ open, onClose, pole }: PoleBarcodeDialogProps) {
  if (!pole) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Pole barcode
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          {pole.poleNumber}
        </Typography>
        <PoleBarcode value={pole.poleNumber} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
