import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { VibookBrandMark } from '@/components/branding/VibookBrandMark';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { getFriendlyErrorMessage } from '@/utils/apiError';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useAdminI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, t('login.failed')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vb-login" data-vb-login-screen="premium">
      <div className="vb-login__card vb-animate-in">
        <header className="vb-login__header">
          <VibookBrandMark size={96} label="" className="vb-login__mark" />
          <h1 className="vb-login__title">{t('login.title')}</h1>
          <p className="vb-login__sub">{t('login.subtitle')}</p>
        </header>

        <form className="vb-login__form" onSubmit={(e) => void onSubmit(e)}>
          <Input
            label={t('login.email')}
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('login.password')}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="vb-login__error">{error}</p> : null}
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}
