import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', organisation: '', password: '', confirm: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(form.email, form.password);
    navigate('/landlord');
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
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Jean-Pierre Habimana" value={form.name} onChange={update('name')} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+250 788 000 000" value={form.phone} onChange={update('phone')} required /></div>
            <div className="space-y-2"><Label>Organisation Name</Label><Input placeholder="Kigali Homes Ltd" value={form.organisation} onChange={update('organisation')} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={form.password} onChange={update('password')} required /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" value={form.confirm} onChange={update('confirm')} required /></div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">Create Account</Button>
            <p className="text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
