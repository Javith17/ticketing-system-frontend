import { useTheme } from '@mui/material';

interface TrendSparklineProps {
  points: number[];
  width?: number;
  height?: number;
}

export default function TrendSparkline({ points, width = 320, height = 78 }: TrendSparklineProps) {
  const theme = useTheme();
  const pad = 6;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const sx = (width - pad * 2) / (points.length - 1);
  const sy = (height - pad * 2) / (max - min || 1);

  const coords = points.map((p, i) => ({
    x: pad + i * sx,
    y: height - pad - (p - min) * sy,
  }));

  const linePath = coords.map((c, i) => `${i ? 'L' : 'M'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `M${pad} ${height - pad} ${coords.map((c) => `L${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')} L${width - pad} ${height - pad} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <path d={areaPath} fill={theme.palette.primary.main} opacity={0.12} />
      <path d={linePath} fill="none" stroke={theme.palette.primary.main} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={2.6} fill={theme.palette.primary.main} />
      ))}
    </svg>
  );
}
