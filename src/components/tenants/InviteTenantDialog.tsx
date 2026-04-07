import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useUnits, useInviteTenant } from '@/hooks/useSupabaseData';
import { Loader2, Mail, Home, Send } from 'lucide-react';

interface InviteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteTenantDialog({ open, onOpenChange }: InviteTenantDialogProps) {
  const [email, setEmail] = useState('');
  const [unitId, setUnitId] = useState<string>('none');
  const { data: units, isLoading: unitsLoading } = useUnits();
  const inviteTenant = useInviteTenant();

  const vacantUnits = (units ?? []).filter(u => u.status === 'VACANT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await inviteTenant.mutateAsync({
        email,
        unit_id: unitId === 'none' ? undefined : unitId
      });

      setEmail('');
      setUnitId('none');
      onOpenChange(false);
    } catch (err) {
      // toast is handled in mutation onSuccess/onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-2xl p-8 bg-white/95 backdrop-blur-sm">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-bizrent-blue/10 flex items-center justify-center mb-2">
            <Mail className="h-6 w-6 text-bizrent-blue" />
          </div>
          <DialogTitle className="text-2xl font-extrabold text-bizrent-navy tracking-tight">
            Invite Tenant
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
            Record an email invitation. The system will automatically link them to your organisation and assigned unit when they sign up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-bold text-bizrent-navy ml-1">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="tenant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-border/60 bg-white/50 focus-visible:ring-bizrent-navy/20 font-medium transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-[13px] font-bold text-bizrent-navy ml-1 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" /> Assign to Unit (Optional)
            </Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger className="h-12 rounded-xl border-border/60 bg-white/50 focus:ring-bizrent-navy/20 font-medium transition-all">
                <SelectValue placeholder="Select a vacant unit" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 shadow-2xl bg-white/95 backdrop-blur-sm">
                <SelectItem value="none" className="font-semibold text-bizrent-navy">Stay unassigned</SelectItem>
                {vacantUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="font-medium py-2.5">
                    Unit {u.unit_number} — { (u as any).properties?.name || 'Property'}
                  </SelectItem>
                ))}
                {vacantUnits.length === 0 && !unitsLoading && (
                  <div className="p-3 text-xs text-center text-muted-foreground italic font-medium">No vacant units available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 flex flex-row gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl font-bold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={inviteTenant.isPending}
              className="flex-1 rounded-xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white font-bold h-12 shadow-md shadow-bizrent-navy/10"
            >
              {inviteTenant.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {inviteTenant.isPending ? 'Processing' : 'Invite User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
