import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NameCountResponse } from '@/api/types';
import { chartColors, statusBarColors } from '@/components/charts/chartTheme';

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Approved',
  PENDING_REVIEW: 'Pending',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
};

export function StatusBarChart({ data }: { data: NameCountResponse[] }) {
  const safe = data ?? [];
  const chartData = safe.map((row) => ({
    ...row,
    label: STATUS_LABEL[row.name] ?? row.name,
  }));
  return (
    <div className="vb-chart-wrap vb-animate-in">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: chartColors.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: chartColors.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--vb-border-light)',
              boxShadow: 'var(--vb-shadow-sm)',
            }}
          />
          <Bar dataKey="count" name="Profiles" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={statusBarColors[entry.name] ?? chartColors.terracotta} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
