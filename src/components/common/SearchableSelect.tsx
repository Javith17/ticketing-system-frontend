import { useEffect, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

interface SearchableSelectProps<T> {
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  fetcher: (searchText: string) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (a: T, b: T) => boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

// Generic debounced server-search Autocomplete - fuses the 300ms-debounce
// idiom already used by LocationsTab/SectionsTab/PolesTab with MUI
// Autocomplete's inputValue/loading props, so Location/Section/Pole pickers
// don't each hand-roll the same wiring.
export default function SearchableSelect<T>({
  label,
  value,
  onChange,
  fetcher,
  getOptionLabel,
  isOptionEqualToValue,
  disabled,
  error,
  helperText,
  placeholder,
}: SearchableSelectProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled || !open) return;
    let active = true;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const results = await fetcher(inputValue.trim());
        if (active) setOptions(results);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(handle);
    };
    // fetcher intentionally omitted: callers pass a fresh closure each render
    // (it may capture a parent id like locationId/sectionId), and recreating
    // it shouldn't itself trigger a new debounce timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, open, disabled]);

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={(opts) => opts}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
