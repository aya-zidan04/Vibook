import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { useAdminTheme } from '@/theme/useAdminTheme';
import type { AdminThemeMode } from '@/theme/themeStore';

const THEME_OPTIONS: { id: AdminThemeMode; labelKey: 'settings.themeDark' | 'settings.themeLight' | 'settings.themeSystem' }[] =
  [
    { id: 'dark', labelKey: 'settings.themeDark' },
    { id: 'light', labelKey: 'settings.themeLight' },
    { id: 'system', labelKey: 'settings.themeSystem' },
  ];

export function SettingsPage() {
  const { t, locale, setLocale } = useAdminI18n();
  const { theme, setTheme } = useAdminTheme();

  return (
    <div className="vb-page">
      <Card padding="lg" style={{ marginBottom: 16 }}>
        <h2 className="vb-card__title" style={{ marginTop: 0 }}>
          {t('settings.appearanceTitle')}
        </h2>
        <p className="vb-muted" style={{ lineHeight: 1.6, maxWidth: 560 }}>
          {t('settings.appearanceDesc')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {THEME_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              variant={theme === opt.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTheme(opt.id)}
            >
              {t(opt.labelKey)}
            </Button>
          ))}
        </div>
      </Card>
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
