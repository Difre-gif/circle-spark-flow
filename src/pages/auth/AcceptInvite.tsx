import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFieldErrors(fe => ({ ...fe, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing invitation token.');
      return;
    }
    
    setError(null);

    // Per-field validation
    const errs: Partial<Record<string, string>> = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirm) errs.confirm = 'Please confirm your password.';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // 1. Fetch invitation email (RPC bypasses RLS safely)
      const { data: invEmail, error: getErr } = await supabase.rpc('get_invitation_email', { p_token: token });
      if (getErr || !invEmail) {
        throw new Error('Invalid or expired invitation. Please request a new invite.');
      }

      // 2. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invEmail,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          // If already registered, they should just login and we accept the invite with their session
          throw new Error('An account with this email already exists. Please log in directly.');
        }
        throw new Error(authError.message);
      }

      // If email confirmation is required, warn them, otherwise proceed to accept
      if (authData.user?.identities?.length === 0) {
        throw new Error('Failed to register identity.');
      }

      // 3. Immediately accept the invitation using the new session
      const { error: acceptErr } = await supabase.rpc('accept_invitation', {
        p_token: token,
        p_name: form.name,
        p_phone: form.phone || ''
      });

      if (acceptErr) {
        // Edge case: Signed up but RPC failed
        throw new Error(`Account created but couldn't link workspace: ${acceptErr.message}`);
      }

      navigate('/tenant');
      
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-bizrent-red">
          <CardContent className="pt-6 pb-8 text-center space-y-4">
            <BizRentLogo size="lg" className="mx-auto" />
            <h2 className="text-xl font-bold text-bizrent-navy">Invalid Invitation Link</h2>
            <p className="text-muted-foreground text-sm">Please check your email and click the exact link provided.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 bg-bizrent-navy p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bizrent-blue/20 to-transparent" />
        <div className="relative z-10">
          <BizRentLogo size="lg" className="text-white" />
          <div className="mt-20 max-w-lg space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight">Welcome to BizRent.</h1>
            <p className="text-lg text-white/80 leading-relaxed font-medium">
              You've been invited to join an organisation workspace. Create your profile below to gain access to your properties, invoices, and payments in one secure portal.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-50 p-4 sm:p-8">
        <Card className="w-full max-w-[420px] shadow-xl border-0 bg-white">
          <CardHeader className="space-y-3 pb-6">
            <div className="lg:hidden flex justify-center mb-2">
              <BizRentLogo size="lg" className="text-bizrent-navy" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Accept Invitation</CardTitle>
            <CardDescription className="text-center font-medium">Set up your profile to join the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl border-red-200 bg-red-50 text-red-900">
                <AlertDescription className="font-semibold">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input placeholder="John Doe" value={form.name} onChange={update('name')} aria-invalid={!!fieldErrors.name} />
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <Label>Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input placeholder="+250 788 000 000" value={form.phone} onChange={update('phone')} />
              </div>
              
              <div className="space-y-1">
                <Label>Set Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={update('password')} aria-invalid={!!fieldErrors.password} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-1">
                <Label>Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={update('confirm')} aria-invalid={!!fieldErrors.confirm} className="pr-10" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirm && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirm}</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-xl mt-4" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Creating Account...' : 'Join Workspace'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
