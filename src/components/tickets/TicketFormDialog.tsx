import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Location, Pole, Section, Severity, Ticket, TicketSource } from '../../types';
import { required, hasErrors, type FieldErrors } from '../../utils/validators';
import { apiPost } from '../../api/client';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createTicket, updateTicket } from '../../redux/slices/ticketsSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { fetchSources } from '../../redux/slices/sourcesSlice';
import SearchableSelect from '../common/SearchableSelect';

const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

interface MasterDetailsListResponse<T> {
  success: boolean;
  page: number;
  count: number;
  list: T[];
}

async function searchLocations(searchText: string): Promise<Location[]> {
  const result = await apiPost<MasterDetailsListResponse<{
    locationId: number;
    locationName: string;
    associateName?: string;
    remarks?: string;
    wapGroupName?: string;
  }>>('/master-details/locations', { page: 1, limit: 20, searchText });
  return result.list.map((l) => ({
    id: l.locationId,
    name: l.locationName,
    associateName: l.associateName,
    remarks: l.remarks,
    wapGroupName: l.wapGroupName,
  }));
}

async function searchSections(searchText: string, locationId: number): Promise<Section[]> {
  const result = await apiPost<MasterDetailsListResponse<{
    sectionId: number;
    sectionName: string;
    displayName?: string | null;
    locationName?: string;
    associateName?: string;
    remarks?: string;
    wapGroupId?: string | null;
  }>>('/master-details/sections', { page: 1, limit: 20, searchText, locationId });
  return result.list.map((s) => ({
    id: s.sectionId,
    name: s.sectionName,
    displayName: s.displayName,
    locationName: s.locationName,
    associateName: s.associateName,
    remarks: s.remarks,
    wapGroupId: s.wapGroupId,
  }));
}

async function searchPoles(searchText: string, sectionId: number): Promise<Pole[]> {
  const result = await apiPost<MasterDetailsListResponse<{
    poleId: number;
    poleNumber: string;
    sectionName?: string;
    locationName?: string;
    associateName?: string;
    latitude?: number;
    longitude?: number;
    meterId?: number;
    installedDate?: string | null;
  }>>('/master-details/poles', { page: 1, limit: 20, searchText, sectionId });
  return result.list.map((p) => ({
    id: p.poleId,
    poleNumber: p.poleNumber,
    sectionName: p.sectionName,
    locationName: p.locationName,
    associateName: p.associateName,
    latitude: p.latitude,
    longitude: p.longitude,
    meterId: p.meterId,
    installedDate: p.installedDate,
  }));
}

type TicketField = 'source' | 'pole' | 'severity' | 'title' | 'description';

interface FormState {
  source: TicketSource | '';
  location: Location | null;
  section: Section | null;
  pole: Pole | null;
  severity: Severity | '';
  title: string;
  description: string;
}

const emptyForm: FormState = {
  source: '',
  location: null,
  section: null,
  pole: null,
  severity: '',
  title: '',
  description: '',
};

interface TicketFormDialogProps {
  open: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
  onCreated?: (ticket: Ticket) => void;
}

export default function TicketFormDialog({ open, onClose, ticket, onCreated }: TicketFormDialogProps) {
  const dispatch = useAppDispatch();
  const sources = useAppSelector((state) => state.sources.items);
  const sourcesStatus = useAppSelector((state) => state.sources.status);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<TicketField>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(ticket);

  useEffect(() => {
    if (open) {
      setForm(
        ticket
          ? {
              source: ticket.source,
              location:
                ticket.locationId != null && ticket.locationName
                  ? { id: ticket.locationId, name: ticket.locationName }
                  : ticket.locationName
                    ? { id: -1, name: ticket.locationName }
                    : null,
              section:
                ticket.sectionId != null && ticket.sectionName
                  ? { id: ticket.sectionId, name: ticket.sectionName }
                  : ticket.sectionName
                    ? { id: -1, name: ticket.sectionName }
                    : null,
              pole:
                ticket.poleId != null && ticket.poleName
                  ? {
                      id: ticket.poleId,
                      poleNumber: ticket.poleName,
                      latitude: ticket.latitude,
                      longitude: ticket.longitude,
                    }
                  : null,
              severity: ticket.severity,
              title: ticket.title,
              description: ticket.description,
            }
          : emptyForm,
      );
      setErrors({});
      if (sourcesStatus !== 'succeeded' && sourcesStatus !== 'loading') dispatch(fetchSources());
    }
  }, [open, ticket, sourcesStatus, dispatch]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const poleError = form.pole
      ? required(form.location?.name, 'Location') || required(form.section?.name, 'Section')
      : 'Pole is required';
    const nextErrors: FieldErrors<TicketField> = {
      source: required(form.source, 'Source'),
      pole: poleError,
      severity: required(form.severity, 'Priority'),
      title: required(form.title, 'Title'),
      description: required(form.description, 'Description'),
    };
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const handleClear = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      source: form.source as TicketSource,
      poleId: form.pole!.id,
      poleName: form.pole!.poleNumber,
      locationName: form.location!.name,
      sectionName: form.section!.name,
      locationId: form.location!.id >= 0 ? form.location!.id : undefined,
      sectionId: form.section!.id >= 0 ? form.section!.id : undefined,
      latitude: form.pole!.latitude,
      longitude: form.pole!.longitude,
      severity: form.severity as Severity,
      title: form.title,
      description: form.description,
    };
    const result = isEdit
      ? await dispatch(updateTicket({ id: ticket!.id, ...payload }))
      : await dispatch(createTicket(payload));
    setSubmitting(false);
    if (isEdit ? updateTicket.fulfilled.match(result) : createTicket.fulfilled.match(result)) {
      dispatch(showSnackbar({ message: isEdit ? 'Ticket updated' : 'Ticket created', severity: 'success' }));
      if (!isEdit) onCreated?.((result as ReturnType<typeof createTicket.fulfilled>).payload);
      onClose();
    } else {
      dispatch(showSnackbar({ message: isEdit ? 'Failed to update ticket' : 'Failed to create ticket', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        {isEdit ? 'Edit ticket' : 'Create new ticket'}
        <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {isEdit && (
            <Grid size={12}>
              <TextField label="Ticket ID" fullWidth value={ticket!.complaintId} disabled />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Source"
              fullWidth
              value={form.source}
              onChange={(e) => setField('source', e.target.value as TicketSource)}
              error={Boolean(errors.source)}
              helperText={errors.source}
            >
              {sources.map((s) => (
                <MenuItem key={s.id} value={s.sourceName}>
                  {s.sourceName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Priority"
              fullWidth
              value={form.severity}
              onChange={(e) => setField('severity', e.target.value as Severity)}
              error={Boolean(errors.severity)}
              helperText={errors.severity}
            >
              {severities.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <SearchableSelect<Location>
              label="Location"
              value={form.location}
              onChange={(value) => {
                setField('location', value);
                setField('section', null);
                setField('pole', null);
              }}
              fetcher={searchLocations}
              getOptionLabel={(l) => l.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              error={Boolean(errors.pole)}
            />
          </Grid>
          <Grid size={12}>
            <SearchableSelect<Section>
              label="Section"
              value={form.section}
              onChange={(value) => {
                setField('section', value);
                setField('pole', null);
              }}
              fetcher={(text) => searchSections(text, form.location!.id)}
              getOptionLabel={(s) => s.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              disabled={!form.location}
              placeholder={!form.location ? 'Select a location first' : undefined}
            />
          </Grid>
          <Grid size={12}>
            <SearchableSelect<Pole>
              label="Pole"
              value={form.pole}
              onChange={(value) => setField('pole', value)}
              fetcher={(text) => searchPoles(text, form.section!.id)}
              getOptionLabel={(p) => p.poleNumber}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              disabled={!form.section}
              placeholder={!form.section ? 'Select a section first' : undefined}
              error={Boolean(errors.pole)}
              helperText={errors.pole}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Title"
              placeholder="Short summary of the issue"
              fullWidth
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Description"
              placeholder="Describe the issue in detail"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {!isEdit && (
          <Button onClick={handleClear} color="inherit">
            Clear
          </Button>
        )}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {isEdit ? 'Save' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
