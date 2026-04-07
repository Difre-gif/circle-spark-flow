import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', organisation: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const pwStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Per-field validation
    const errs: Partial<Record<string, string>> = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email address is required.';
    if (!form.organisation.trim()) errs.organisation = 'Organisation name is required.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirm) errs.confirm = 'Please confirm your password.';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

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

      // Fire-and-forget: welcome email to new landlord
      supabase.functions.invoke('send-email', {
        body: {
          to: form.email,
          type: 'welcome-landlord',
          data: { name: form.name, orgName: form.organisation },
        },
      }).catch(() => { /* ignore */ });

      navigate('/landlord');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors(fe => ({ ...fe, [key]: undefined }));
  };

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
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Jean-Pierre Habimana" value={form.name} onChange={update('name')} aria-invalid={!!fieldErrors.name} />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} aria-invalid={!!fieldErrors.email} />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label>Phone <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
              <Input placeholder="+250 788 000 000" value={form.phone} onChange={update('phone')} />
            </div>
            <div className="space-y-1">
              <Label>Organisation Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Kigali Homes Ltd" value={form.organisation} onChange={update('organisation')} aria-invalid={!!fieldErrors.organisation} />
              {fieldErrors.organisation && <p className="text-xs text-red-500 mt-1">{fieldErrors.organisation}</p>}
            </div>
            <div className="space-y-1">
              <Label>Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={update('password')} aria-invalid={!!fieldErrors.password} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pwStrength.score >= i ? pwStrength.color : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${pwStrength.score <= 1 ? 'text-red-500' : pwStrength.score <= 2 ? 'text-amber-500' : pwStrength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    {pwStrength.label} password
                  </p>
                </div>
              )}
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>
            <div className="space-y-1">
              <Label>Confirm Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={update('confirm')} aria-invalid={!!fieldErrors.confirm} className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirm && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirm}</p>}
            </div>
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
