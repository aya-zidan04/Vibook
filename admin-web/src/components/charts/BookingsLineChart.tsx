import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import type { TimeSeriesPointResponse } from '@/api/types';
import { formatChartDay } from '@/components/charts/chartFormat';
import { chartColors } from '@/components/charts/chartTheme';

export function BookingsLineChart({ data }: { data: TimeSeriesPointResponse[] }) {
  const { t } = useAdminI18n();
  const safe = data ?? [];
  const chartData = safe.map((p) => ({ ...p, label: formatChartDay(p.date) }));
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
          <Line
            type="monotone"
            dataKey="count"
            name={t('charts.newBookings')}
            stroke={chartColors.accentSoft}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
