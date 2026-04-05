import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', organisation: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create auth user with metadata (trigger creates public.users automatically)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone || null,
          },
        },
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Registration failed. Please try again.');

      // 2. Use the register_organisation() SECURITY DEFINER function
      // This atomically creates org + OWNER role + TRIAL subscription
      const slug = form.organisation.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error: orgError } = await supabase.rpc('register_organisation', {
        p_name: form.organisation,
        p_slug: slug || `org-${Date.now()}`,
        p_email: form.email,
        p_phone: form.phone || null,
      });
      if (orgError) {
        // If org creation fails, sign out the user
        await supabase.auth.signOut();
        throw new Error(orgError.message);
      }

      navigate('/landlord');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center"><BizRentLogo size="lg" className="text-primary" /></div>
          <div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start managing your properties with BizRent</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Jean-Pierre Habimana" value={form.name} onChange={update('name')} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+250 788 000 000" value={form.phone} onChange={update('phone')} /></div>
            <div className="space-y-2"><Label>Organisation Name</Label><Input placeholder="Kigali Homes Ltd" value={form.organisation} onChange={update('organisation')} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={form.password} onChange={update('password')} required /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" value={form.confirm} onChange={update('confirm')} required /></div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
