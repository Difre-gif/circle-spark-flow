import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface InvitationDetails {
  id: string;
  email: string;
  org_name: string;
  unit_info: string | null;
  role: string;
  is_valid: boolean;
  user_exists: boolean;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const [alreadySignedIn, setAlreadySignedIn] = useState(false);

  // Step 1: fetch invitation details using the public RPC
  useEffect(() => {
    if (!token) { 
      setFetchError('Invalid invitation link — no token found.'); 
      setFetching(false); 
      return; 
    }

    (async () => {
      const { data, error } = await supabase.rpc('get_invitation_by_token', { p_token: token });
      if (error || !data || data.length === 0 || !data[0].is_valid) {
        setFetchError('This invitation link is invalid or has expired.');
      } else {
        setInvitation(data[0] as InvitationDetails);
      }
      setFetching(false);
    })();
  }, [token]);

  // Step 2: Check if already signed in as the invitee
  useEffect(() => {
    if (!token || fetching || !invitation) return;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify the session isn't a phantom session by fetching the user from the server
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          // Phantom session (user deleted on backend but token exists locally)
          await supabase.auth.signOut();
          return;
        }

        if (user.email?.toLowerCase() === invitation.email.toLowerCase()) {
          setAlreadySignedIn(true);
        } else {
          // Signed in as someone else, sign them out so they can sign in/up as the invitee
          await supabase.auth.signOut();
        }
      }
    })();
  }, [token, fetching, invitation]);

  // Debounce username check
  useEffect(() => {
    if (!username.trim() || invitation?.user_exists) {
      setUsernameAvailable(null);
      return;
    }

    const checkUnique = async () => {
      setCheckingUsername(true);
      const { data, error } = await supabase.rpc('check_username_available', { p_username: username.trim() });
      if (!error && data !== null) {
        setUsernameAvailable(data);
        if (!data) {
          setErrors(prev => ({ ...prev, username: 'Username is already taken.' }));
        } else {
          setErrors(prev => {
            const next = { ...prev };
            delete next.username;
            return next;
          });
        }
      }
      setCheckingUsername(false);
    };

    const timeoutId = setTimeout(checkUnique, 500);
    return () => clearTimeout(timeoutId);
  }, [username, invitation?.user_exists]);

  const completeInvitation = async (tok: string, fullName: string, uname?: string) => {
    const { error } = await supabase.rpc('accept_invitation', {
      p_token: tok,
      p_full_name: fullName || undefined,
      p_username: uname || undefined,
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

  const handleJoinExisting = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      await completeInvitation(token!, '', '');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to join organisation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    if (!invitation || !token) return;

    // Validate
    const errs: Record<string, string> = {};
    if (!invitation.user_exists) {
      if (!name.trim()) errs.name = 'Full name is required.';
      if (!username.trim()) errs.username = 'Username is required.';
      if (usernameAvailable === false) errs.username = 'Username is already taken.';
      if (password !== confirm) errs.confirm = 'Passwords do not match.';
    }
    
    if (!password) errs.password = 'Password is required.';
    else if (!invitation.user_exists && password.length < 8) errs.password = 'Password must be at least 8 characters.';
    
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (invitation.user_exists) {
        // User exists, so we just log them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: invitation.email,
          password,
        });
        if (signInError) throw new Error('Incorrect password. Please try again.');
        await completeInvitation(token, '');
      } else {
        // New user sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: invitation.email,
          password,
          options: {
            data: { full_name: name.trim(), username: username.trim() },
            // After email confirmation Supabase will redirect here with an active session
            emailRedirectTo: `${window.location.origin}/accept-invite?token=${token}`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          // Email confirmation is disabled — user is immediately signed in
          await completeInvitation(token, name.trim(), username.trim());
        } else {
          // Email confirmation is required
          setEmailSent(true);
          // Store token so we can complete after confirmation
          localStorage.setItem('pending_invite_token', token);
        }
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

  if (alreadySignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center"><BizRentLogo size="lg" className="text-primary" /></div>
            <div>
              <CardTitle className="text-2xl">Join {invitation?.org_name}</CardTitle>
              <CardDescription>
                You are currently signed in as <strong>{invitation?.email}</strong>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {globalError && (
              <Alert variant="destructive">
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              You've been invited to join <strong>{invitation?.org_name}</strong> as a {invitation?.role.toLowerCase()}.
              {invitation?.unit_info && ` You will be linked to ${invitation.unit_info}.`}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleJoinExisting} className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Joining...</> : 'Accept Invitation & Join'}
            </Button>
          </CardFooter>
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
            <CardTitle className="text-2xl">
              {invitation?.user_exists ? 'Sign in to accept' : 'Set up your account'}
            </CardTitle>
            <CardDescription>
              {invitation?.user_exists 
                ? <>Sign in as <strong>{invitation?.email}</strong></>
                : <>Creating account for <strong>{invitation?.email}</strong></>
              }
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
            
            {/* Read-only email field */}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={invitation?.email || ''} readOnly className="bg-muted text-muted-foreground" />
            </div>

            {!invitation?.user_exists && (
              <>
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
                  <Label>Username <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      placeholder="jp_habimana"
                      value={username}
                      onChange={e => { 
                        setUsername(e.target.value); 
                        setErrors(ev => ({ ...ev, username: '' })); 
                        setUsernameAvailable(null);
                      }}
                      aria-invalid={!!errors.username}
                      className={usernameAvailable === true ? "border-emerald-500 focus-visible:ring-emerald-500" : ""}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!checkingUsername && usernameAvailable === true && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {!checkingUsername && usernameAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                  {!errors.username && usernameAvailable === true && (
                    <p className="text-xs text-emerald-500">Username is available</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Password <span className="text-red-500">*</span></Label>
                {invitation?.user_exists && (
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder={invitation?.user_exists ? "Enter your password" : "Min. 8 characters"}
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

            {!invitation?.user_exists && (
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
            )}
          </CardContent>
          <div className="px-6 pb-6 space-y-3">
            <Button type="submit" className="w-full" disabled={loading || checkingUsername || usernameAvailable === false}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{invitation?.user_exists ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                invitation?.user_exists ? 'Sign In & Accept' : 'Accept & Create Account'
              )}
            </Button>
            {!invitation?.user_exists && (
              <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to join <strong>{invitation?.org_name}</strong>.
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
