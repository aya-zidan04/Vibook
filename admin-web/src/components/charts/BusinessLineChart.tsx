import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeSeriesPointResponse } from '@/api/types';
import { chartColors } from '@/components/charts/chartTheme';

function formatDay(iso: string) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function BusinessLineChart({ data }: { data: TimeSeriesPointResponse[] }) {
  const safe = data ?? [];
  const chartData = safe.map((p) => ({ ...p, label: formatDay(p.date) }));
  return (
    <div className="vb-chart-wrap vb-animate-in">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: chartColors.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: chartColors.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--vb-border-light)',
              boxShadow: 'var(--vb-shadow-sm)',
            }}
            labelStyle={{ fontWeight: 700 }}
          />
          <Line type="monotone" dataKey="count" name="New businesses" stroke={chartColors.plum} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
