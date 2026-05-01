import { Card } from '@/components/ui/Card';

export function SettingsPage() {
  return (
    <div className="vb-page">
      <Card padding="lg">
        <h2 className="vb-card__title" style={{ marginTop: 0 }}>
          Settings
        </h2>
        <p className="vb-muted" style={{ lineHeight: 1.6, maxWidth: 560 }}>
          <strong style={{ color: 'var(--vb-text)' }}>Coming soon.</strong> Admin preferences (theme toggle,
          notifications, audit options) will live here. Authentication still uses the secure JWT flow with tokens
          stored in your browser.
        </p>
      </Card>
    </div>
  );
}
