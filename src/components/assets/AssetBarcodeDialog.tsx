import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Asset } from '../../types';
import AssetBarcode from './AssetBarcode';

interface AssetBarcodeDialogProps {
  open: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export default function AssetBarcodeDialog({ open, onClose, asset }: AssetBarcodeDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        Asset barcode
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          {asset.name}
        </Typography>
        <AssetBarcode value={asset.barcode || asset.id} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
