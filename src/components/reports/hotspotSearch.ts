import { apiPost } from '../../api/client';
import type { Location } from '../../types';

interface MasterDetailsListResponse<T> {
  success: boolean;
  page: number;
  count: number;
  list: T[];
}

// Small local helper for the hotspot tabs' "jump to location" picker - mirrors
// the same inline pattern already used in TicketFormDialog.tsx.
export async function searchLocationsForHotspot(searchText: string): Promise<Location[]> {
  const result = await apiPost<MasterDetailsListResponse<{ locationId: number; locationName: string }>>(
    '/master-details/locations',
    { page: 1, limit: 20, searchText },
  );
  return result.list.map((l) => ({ id: l.locationId, name: l.locationName }));
}
