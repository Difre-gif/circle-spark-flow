import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center"><BizRentLogo size="lg" className="text-primary" /></div>
          <div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>We'll send you a link to reset your password</CardDescription>
          </div>
        </CardHeader>
        {sent ? (
          <CardContent className="text-center space-y-4 pb-8">
            <CheckCircle className="mx-auto h-12 w-12 text-bizrent-emerald" />
            <p className="text-sm text-muted-foreground">If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.</p>
            <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full">Send Reset Link</Button>
              <Link to="/login" className="text-sm text-muted-foreground hover:underline">Back to login</Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
