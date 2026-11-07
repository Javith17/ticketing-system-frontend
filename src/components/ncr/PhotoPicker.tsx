import { useRef, useState } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// Same limits the backend enforces on NCR uploads (FilesInterceptor(..., 3)
// and TICKET_IMAGE_MULTER_OPTIONS): up to 3 images, 10 MB each.
const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface PhotoPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
}

/** Attach up to 3 photos, shown as removable chips. */
export default function PhotoPicker({ files, onChange }: PhotoPickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>();

  const handleFiles = (picked: FileList | null) => {
    if (!picked) return;
    const incoming = Array.from(picked);
    const invalid = incoming.find((f) => !ALLOWED_TYPES.includes(f.type));
    const tooBig = incoming.find((f) => f.size > MAX_FILE_BYTES);
    if (invalid) {
      setError(`${invalid.name} is not an image (JPG, PNG, WEBP or GIF)`);
    } else if (tooBig) {
      setError(`${tooBig.name} is larger than 10 MB`);
    } else if (files.length + incoming.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} photos`);
    } else {
      onChange([...files, ...incoming]);
      setError(undefined);
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <Box>
      <input
        ref={fileInput}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        variant="outlined"
        size="small"
        startIcon={<AttachFileIcon />}
        onClick={() => fileInput.current?.click()}
        disabled={files.length >= MAX_FILES}
      >
        Attach photos ({files.length}/{MAX_FILES})
      </Button>
      {files.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
          {files.map((f, i) => (
            <Chip
              key={`${f.name}-${i}`}
              label={f.name}
              size="small"
              onDelete={() => onChange(files.filter((_, idx) => idx !== i))}
            />
          ))}
        </Box>
      )}
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
