import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminI18n } from '@/i18n/useAdminI18n';

export function SettingsPage() {
  const { t, locale, setLocale } = useAdminI18n();

  return (
    <div className="vb-page">
      <Card padding="lg" style={{ marginBottom: 16 }}>
        <h2 className="vb-card__title" style={{ marginTop: 0 }}>
          {t('settings.languageTitle')}
        </h2>
        <p className="vb-muted" style={{ lineHeight: 1.6, maxWidth: 560 }}>
          {t('settings.languageDesc')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button
            variant={locale === 'en' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setLocale('en')}
          >
            {t('common.english')}
          </Button>
          <Button
            variant={locale === 'ar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setLocale('ar')}
          >
            {t('common.arabic')}
          </Button>
        </div>
      </Card>
      <Card padding="lg">
        <h2 className="vb-card__title" style={{ marginTop: 0 }}>
          {t('settings.comingTitle')}
        </h2>
        <p className="vb-muted" style={{ lineHeight: 1.6, maxWidth: 560 }}>
          {t('settings.comingBody')}
        </p>
      </Card>
    </div>
  );
}
