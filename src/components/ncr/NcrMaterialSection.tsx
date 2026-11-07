import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { NcrMaterialRequest } from '../../types';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '');

/**
 * Material request summary inside the NCR detail window: requested /
 * approved / issued quantities with serial and batch numbers, receipt, and
 * returned items with their disposition (process flow steps #37-#44).
 */
export default function NcrMaterialSection({ request }: { request: NcrMaterialRequest }) {
  const hasIssue = Boolean(request.issuedAt);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Material request
        </Typography>
        <Chip label={request.status} size="small" variant="outlined" />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Material</TableCell>
            <TableCell align="right">Requested</TableCell>
            <TableCell align="right">Approved</TableCell>
            <TableCell align="right">Issued</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {request.details.map((d) => (
            <TableRow key={d.id} sx={{ verticalAlign: 'top' }}>
              <TableCell>
                <Typography variant="body2">{d.materialName}</Typography>
                {d.issues.map((i) => (
                  <Typography key={i.id} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {i.quantity} × {[i.serialNo && `S/N ${i.serialNo}`, i.batchNo && `Batch ${i.batchNo}`].filter(Boolean).join(' · ') || 'no serial / batch'}
                  </Typography>
                ))}
              </TableCell>
              <TableCell align="right">{d.materialQty}</TableCell>
              <TableCell align="right">{d.approvedQty ?? '-'}</TableCell>
              <TableCell align="right">{hasIssue ? (d.issuedQty ?? 0) : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {request.remarks && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Request remarks: {request.remarks}
        </Typography>
      )}
      {hasIssue && (
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          <b>Issued</b> by {request.issuedByName || 'Stores'} · {fmt(request.issuedAt)}
          {request.issueRemarks ? ` — ${request.issueRemarks}` : ''}
        </Typography>
      )}
      {request.receivedAt && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <b>Received</b> by {request.receivedByName || 'Technician'} · {fmt(request.receivedAt)}
          {request.receiptRemarks ? ` — ${request.receiptRemarks}` : ''}
        </Typography>
      )}

      {request.returns.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
            Returned items
          </Typography>
          {request.returns.map((r) => (
            <Box key={r.id} sx={{ mb: 1.25, pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {r.itemName} × {r.quantity}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {[r.serialNo && `S/N ${r.serialNo}`, r.batchNo && `Batch ${r.batchNo}`, r.conditionRemarks]
                  .filter(Boolean)
                  .join(' · ')}
                {r.returnedAt ? ` · returned by ${r.returnedByName || 'technician'} ${fmt(r.returnedAt)}` : ''}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {r.disposition ? (
                  <>
                    <b>{r.disposition}</b> — {r.dispositionByName || 'Stores'} {fmt(r.dispositionAt)}
                    {r.dispositionRemarks ? ` · ${r.dispositionRemarks}` : ''}
                  </>
                ) : (
                  <i>Awaiting Stores disposition</i>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
