import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { NameCountResponse } from '@/api/types';
import { pieColors } from '@/components/charts/chartTheme';
import { useAdminI18n } from '@/i18n/useAdminI18n';

export function CategoryPieChart({ data }: { data: NameCountResponse[] }) {
  const { t } = useAdminI18n();
  const rows = data ?? [];
  if (!rows.length) {
    return (
      <p className="vb-muted" style={{ padding: '2rem', textAlign: 'center' }}>
        {t('dashboard.topCategoriesEmpty')}
      </p>
    );
  }
  return (
    <div className="vb-chart-wrap vb-animate-in">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={rows as { name: string; count: number }[]}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
          >
            {rows.map((_, i) => (
              <Cell key={rows[i].name} fill={pieColors[i % pieColors.length]} stroke="var(--vb-surface)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--vb-border-light)',
              boxShadow: 'var(--vb-shadow-sm)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
