import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box } from '@mui/material';

interface AssetBarcodeProps {
  value: string;
  height?: number;
}

export default function AssetBarcode({ value, height = 60 }: AssetBarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    JsBarcode(svgRef.current, value, {
      format: 'CODE128',
      height,
      width: 2,
      displayValue: true,
      fontSize: 14,
      margin: 8,
    });
  }, [value, height]);

  if (!value) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} />
    </Box>
  );
}
