import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useAppDispatch } from '../../redux/hooks';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { buildCsv, downloadCsvFile, parseCsvToObjects } from '../../utils/csv';

interface CsvImportButtonsProps {
  sampleFilename: string;
  sampleHeaders: string[];
  sampleRow: string[];
  entityLabelPlural: string;
  onImport: (rows: Record<string, string>[]) => Promise<{ success: number; failed: number }>;
}

export default function CsvImportButtons({
  sampleFilename,
  sampleHeaders,
  sampleRow,
  entityLabelPlural,
  onImport,
}: CsvImportButtonsProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);

  const handleDownloadSample = () => {
    const csv = buildCsv(sampleHeaders, [sampleRow]);
    downloadCsvFile(sampleFilename, csv);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const text = await file.text();
    const rows = parseCsvToObjects(text);
    if (rows.length === 0) {
      dispatch(showSnackbar({ message: 'CSV file has no data rows', severity: 'error' }));
      return;
    }

    setImporting(true);
    const { success, failed } = await onImport(rows);
    setImporting(false);

    dispatch(
      showSnackbar({
        message: `Imported ${success} of ${rows.length} ${entityLabelPlural}${failed ? ` — ${failed} failed` : ''}`,
        severity: failed ? 'warning' : 'success',
      })
    );
  };

  return (
    <>
      <Button variant="outlined" size="small" startIcon={<DescriptionOutlinedIcon />} onClick={handleDownloadSample}>
        Sample CSV
      </Button>
      <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={handleImportClick} disabled={importing}>
        {importing ? 'Importing…' : 'Import CSV'}
      </Button>
      <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleFileChange} />
    </>
  );
}
