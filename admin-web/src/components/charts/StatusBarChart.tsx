import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import type { NameCountResponse } from '@/api/types';
import { chartColors, statusBarColors } from '@/components/charts/chartTheme';

const STATUS_KEY: Record<string, string> = {
  APPROVED: 'status.approved',
  PENDING_REVIEW: 'status.pendingReview',
  REJECTED: 'status.rejected',
  DRAFT: 'status.draft',
};

export function StatusBarChart({ data }: { data: NameCountResponse[] }) {
  const { t } = useAdminI18n();
  const safe = (data ?? []).filter((row) => row.name !== 'DRAFT');
  const chartData = safe.map((row) => ({
    ...row,
    label: STATUS_KEY[row.name] ? t(STATUS_KEY[row.name]) : row.name,
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
          <Bar dataKey="count" name={t('charts.profiles')} radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={statusBarColors[entry.name] ?? chartColors.terracotta} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
