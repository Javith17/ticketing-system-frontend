import { fetchTicketsHotspot } from '../../redux/slices/reportsSlice';
import HotspotReportTab from './HotspotReportTab';

export default function TicketsHotspotTab() {
  return (
    <HotspotReportTab
      exportLabel="ticket hotspot report"
      fetchThunk={fetchTicketsHotspot}
      selectSlot={(state) => state.reports.ticketsHotspot}
    />
  );
}
