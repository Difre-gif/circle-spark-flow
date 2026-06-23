import { useTranslation } from 'react-i18next';
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
import { getCyclePreview } from '@/lib/billingCycles';

interface InviteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InitialInvoiceStrategy = 'DEPOSIT_ONLY' | 'RENT_IMMEDIATE' | 'DEPOSIT_AND_RENT' | 'NONE';

export function InviteTenantDialog({ open, onOpenChange }: InviteTenantDialogProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [unitId, setUnitId] = useState<string>('none');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [anchorDay, setAnchorDay] = useState(new Date().getDate());
  const [rent, setRent] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number | ''>('');
  const [invoiceLeadDays, setInvoiceLeadDays] = useState<number | ''>('');
  const [invoiceSendTime, setInvoiceSendTime] = useState('');
  const [initialInvoiceStrategy, setInitialInvoiceStrategy] = useState<InitialInvoiceStrategy>('DEPOSIT_ONLY');
  const { data: units, isLoading: unitsLoading } = useUnits();
  const inviteTenant = useInviteTenant();

  const vacantUnits = (units ?? []).filter(u => u.status === 'VACANT');
  const selectedUnit = vacantUnits.find(u => u.id === unitId);
  const cyclePreview = getCyclePreview(startDate, anchorDay);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await inviteTenant.mutateAsync({
        email,
        unit_id: unitId === 'none' ? undefined : unitId,
        tenancy_start_date: unitId === 'none' ? undefined : startDate,
        agreed_rent: unitId === 'none' ? undefined : Number(rent || selectedUnit?.monthly_rent || 0),
        deposit_amount: unitId === 'none' ? undefined : Number(deposit || 0),
        billing_frequency: 'MONTHLY',
        period_anchor_day: unitId === 'none' ? undefined : anchorDay,
        invoice_lead_days: unitId === 'none' || invoiceLeadDays === '' ? undefined : Number(invoiceLeadDays),
        invoice_send_time: unitId === 'none' || !invoiceSendTime ? undefined : invoiceSendTime,
        initial_invoice_strategy: unitId === 'none' ? undefined : initialInvoiceStrategy,
      });

      setEmail('');
      setUnitId('none');
      setStartDate(new Date().toISOString().split('T')[0]);
      setAnchorDay(new Date().getDate());
      setRent('');
      setDeposit('');
      setInvoiceLeadDays('');
      setInvoiceSendTime('');
      setInitialInvoiceStrategy('DEPOSIT_ONLY');
      onOpenChange(false);
    } catch (err) {
      // toast is handled in mutation onSuccess/onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[425px] rounded-[2rem] border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <DialogHeader className="shrink-0 space-y-3 px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <div className="w-12 h-12 rounded-2xl bg-bizrent-blue/10 flex items-center justify-center mb-2">
            <Mail className="h-6 w-6 text-bizrent-blue" />
          </div>
          <DialogTitle className="text-2xl font-extrabold text-bizrent-navy dark:text-white tracking-tight">
            Invite a tenant
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
            Send an invite and, if you already know their unit, set up their rent details now.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4 sm:px-8 custom-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-bizrent-navy dark:text-white ml-1">Tenant email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="tenant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-border/60 bg-card/50 focus-visible:ring-bizrent-navy/20 font-medium transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-sm font-bold text-bizrent-navy dark:text-white ml-1 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" /> Choose their unit
            </Label>
            <Select value={unitId} onValueChange={value => {
              setUnitId(value);
              const unit = vacantUnits.find(u => u.id === value);
              if (unit) setRent(unit.monthly_rent);
            }}>
              <SelectTrigger className="h-12 rounded-xl border-border/60 bg-card/50 focus:ring-bizrent-navy/20 font-medium transition-all">
                <SelectValue placeholder="Select a vacant unit" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-sm">
                <SelectItem value="none" className="font-semibold text-bizrent-navy dark:text-white">I will assign a unit later</SelectItem>
                {vacantUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="font-medium py-2.5">
                    Unit {u.unit_number} — { (u as any).properties?.name || 'Property'}
                  </SelectItem>
                ))}
                {vacantUnits.length === 0 && !unitsLoading && (
                  <div className="p-3 text-xs text-center text-muted-foreground italic font-medium">{t('legacy.noVacantUnitsAvailable')}</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {unitId !== 'none' && (
            <div className="space-y-5 rounded-2xl border border-bizrent-blue/10 bg-bizrent-blue/5 p-4">
              <div>
                <p className="text-sm font-extrabold text-bizrent-navy dark:text-white">Rent setup for this unit</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                  These details help BizRent create invoices automatically. You can leave reminder timing blank to use your workspace defaults.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">Rent starts on</Label>
                  <Input type="date" value={startDate} onChange={e => {
                    setStartDate(e.target.value);
                    if (e.target.value) setAnchorDay(new Date(`${e.target.value}T12:00:00`).getDate());
                  }} />
                  <p className="text-xxs text-muted-foreground">The first day this tenant should be billed.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">Monthly billing day</Label>
                  <Input type="number" min="1" max="31" value={anchorDay} onChange={e => setAnchorDay(Number(e.target.value))} />
                  <p className="text-xxs text-muted-foreground">Example: 23 means rent is billed on the 23rd each month.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-bizrent-navy dark:text-white">Send invoice before rent is due</Label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <Input type="number" min="0" max="30" placeholder="Use default" value={invoiceLeadDays} onChange={e => setInvoiceLeadDays(e.target.value === '' ? '' : Number(e.target.value))} />
                  <span className="text-xs font-medium text-muted-foreground">days before</span>
                </div>
                <p className="text-xxs text-muted-foreground">Leave empty unless this tenant needs a different invoice schedule.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-bizrent-navy dark:text-white">Invoice send time</Label>
                <Input type="time" value={invoiceSendTime} onChange={e => setInvoiceSendTime(e.target.value)} />
                <p className="text-xxs text-muted-foreground">Optional. Leave empty to use the normal workspace time.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.monthlyRent')}</Label>
                  <Input type="number" value={rent} onChange={e => setRent(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">Security deposit</Label>
                  <Input type="number" value={deposit} onChange={e => setDeposit(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-bizrent-navy dark:text-white">First payment request</Label>
                <Select value={initialInvoiceStrategy} onValueChange={value => setInitialInvoiceStrategy(value as InitialInvoiceStrategy)}>
                  <SelectTrigger className="h-12 rounded-xl border-border/60 bg-card/50 focus:ring-bizrent-navy/20 font-medium transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-sm">
                    <SelectItem value="DEPOSIT_ONLY" className="font-medium py-2.5">
                      Deposit now, first rent next cycle
                    </SelectItem>
                    <SelectItem value="RENT_IMMEDIATE" className="font-medium py-2.5">
                      First month rent now
                    </SelectItem>
                    <SelectItem value="DEPOSIT_AND_RENT" className="font-medium py-2.5">
                      Deposit and first month rent now
                    </SelectItem>
                    <SelectItem value="NONE" className="font-medium py-2.5">
                      Do not create an invoice yet
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xxs text-muted-foreground">
                  Choose what the tenant should see immediately after accepting the invite.
                </p>
              </div>
              {cyclePreview && (
                <p className="text-xs font-semibold text-bizrent-navy dark:text-white">
                  Rent cycle: {cyclePreview.label}
                </p>
              )}
            </div>
          )}

          </div>

          <DialogFooter className="shrink-0 border-t border-border/60 bg-card/95 px-6 py-4 sm:px-8 flex flex-row gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl font-bold text-muted-foreground hover:bg-muted"
            >
              {t('legacy.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={inviteTenant.isPending}
              className="flex-1 rounded-xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white font-bold h-12 shadow-md shadow-bizrent-navy/10"
            >
              {inviteTenant.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {inviteTenant.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
