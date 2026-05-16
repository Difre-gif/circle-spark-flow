import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center"><BizRentLogo size="lg" className="text-primary" /></div>
          <div>
            <CardTitle className="text-2xl">{t('legacy.resetYourPassword')}</CardTitle>
            <CardDescription>{t('legacy.resetLinkDescription')}</CardDescription>
          </div>
        </CardHeader>
        {sent ? (
          <CardContent className="text-center space-y-4 pb-8">
            <CheckCircle className="mx-auto h-12 w-12 text-bizrent-emerald" />
            <p className="text-sm text-muted-foreground">{t('legacy.ifAnAccountExistsFor')} <strong>{email}</strong>, you'll receive a password reset link shortly.</p>
            <Link to="/login" className="text-sm text-primary hover:underline">{t('legacy.backToLogin')}</Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2"><Label>{t('legacy.email')}</Label><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link to="/login" className="text-sm text-muted-foreground hover:underline">{t('legacy.backToLogin')}</Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}