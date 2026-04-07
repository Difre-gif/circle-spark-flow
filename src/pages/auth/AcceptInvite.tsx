import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface InvitationDetails {
  id: string;
  email: string;
  org_name: string;
  unit_info: string | null;
  role: string;
  is_valid: boolean;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Step 1: fetch invitation details using the public RPC
  useEffect(() => {
    if (!token) { setFetchError('Invalid invitation link — no token found.'); setFetching(false); return; }

    (async () => {
      const { data, error } = await supabase.rpc('get_invitation_by_token', { p_token: token });
      if (error || !data || data.length === 0 || !data[0].is_valid) {
        setFetchError('This invitation link is invalid or has already been used.');
      } else {
        setInvitation(data[0] as InvitationDetails);
      }
      setFetching(false);
    })();
  }, [token]);

  // Step 2: if the user is already signed in when they land here (e.g. after email
  // confirmation redirect), complete the invitation automatically.
  useEffect(() => {
    if (!token || fetching || !invitation) return;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await completeInvitation(token, '');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fetching, invitation]);

  const completeInvitation = async (tok: string, fullName: string) => {
    const { error } = await supabase.rpc('accept_invitation', {
      p_token: tok,
      p_full_name: fullName || undefined,
    });
    if (error) throw error;
    // Reload the profile so the auth store picks up the new org + role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.refreshSession();
    }
    // Redirect based on role
    const dest = invitation?.role === 'TENANT' ? '/tenant' : '/landlord';
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    if (!invitation || !token) return;

    // Validate
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (password !== confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: { full_name: name.trim() },
          // After email confirmation Supabase will redirect here with an active session
          emailRedirectTo: `${window.location.origin}/accept-invite?token=${token}`,
        },
      });

      if (signUpError) {
        // If the user already exists, try signing in instead
        if (signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('already been registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: invitation.email,
            password,
          });
          if (signInError) throw new Error('Account already exists but password is incorrect. Try signing in at /login.');
          await completeInvitation(token, name.trim());
          return;
        }
        throw signUpError;
      }

      if (data.session) {
        // Email confirmation is disabled — user is immediately signed in
        await completeInvitation(token, name.trim());
      } else {
        // Email confirmation is required
        setEmailSent(true);
        // Store token so we can complete after confirmation (handled in the useEffect above)
        localStorage.setItem('pending_invite_token', token);
        localStorage.setItem('pending_invite_name', name.trim());
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 space-y-4">
            <div className="text-4xl">🔗</div>
            <h2 className="text-xl font-bold">Invalid Invitation</h2>
            <p className="text-muted-foreground text-sm">{fetchError}</p>
            <Button onClick={() => navigate('/login')} variant="outline">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500" />
            <h2 className="text-xl font-bold">Check your email</h2>
            <p className="text-muted-foreground text-sm">
              We've sent a confirmation link to <strong>{invitation?.email}</strong>.
              Click it to confirm your account — you'll be automatically signed in and linked to <strong>{invitation?.org_name}</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center"><BizRentLogo size="lg" className="text-primary" /></div>
          <div className="flex items-center justify-center gap-2 bg-muted rounded-xl px-4 py-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs font-semibold text-muted-foreground">You've been invited to</p>
              <p className="font-bold text-sm">{invitation?.org_name}</p>
              {invitation?.unit_info && <p className="text-xs text-muted-foreground">{invitation.unit_info}</p>}
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Set up your account</CardTitle>
            <CardDescription>
              Creating account for <strong>{invitation?.email}</strong>
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {globalError && (
              <Alert variant="destructive">
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Jean-Pierre Habimana"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(ev => ({ ...ev, name: '' })); }}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(ev => ({ ...ev, password: '' })); }}
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-1">
              <Label>Confirm Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(ev => ({ ...ev, confirm: '' })); }}
                  className="pr-10"
                  aria-invalid={!!errors.confirm}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
            </div>
          </CardContent>
          <div className="px-6 pb-6 space-y-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Accept & Create Account'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
