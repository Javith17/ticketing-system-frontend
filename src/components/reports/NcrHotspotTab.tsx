import { fetchNcrHotspot } from '../../redux/slices/reportsSlice';
import HotspotReportTab from './HotspotReportTab';

export default function NcrHotspotTab() {
  return (
    <HotspotReportTab
      exportLabel="NCR hotspot report"
      fetchThunk={fetchNcrHotspot}
      selectSlot={(state) => state.reports.ncrHotspot}
    />
  );
}
