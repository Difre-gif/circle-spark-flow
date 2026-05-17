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
      });

      setEmail('');
      setUnitId('none');
      setStartDate(new Date().toISOString().split('T')[0]);
      setAnchorDay(new Date().getDate());
      setRent('');
      setDeposit('');
      setInvoiceLeadDays('');
      setInvoiceSendTime('');
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
            {t('legacy.inviteTenant')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
            {t('legacy.recordAnEmailInvitationTheSystemWillAutomaticallyLinkThemToYourOrganis')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4 sm:px-8 custom-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-bizrent-navy dark:text-white ml-1">{t('legacy.emailAddress')} <span className="text-red-500">*</span></Label>
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
              <Home className="h-3.5 w-3.5" /> {t('legacy.assignToUnitOptional')}
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
                <SelectItem value="none" className="font-semibold text-bizrent-navy dark:text-white">{t('legacy.stayUnassigned')}</SelectItem>
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
            <div className="space-y-4 rounded-2xl border border-bizrent-blue/10 bg-bizrent-blue/5 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.moveInDate')}</Label>
                  <Input type="date" value={startDate} onChange={e => {
                    setStartDate(e.target.value);
                    if (e.target.value) setAnchorDay(new Date(`${e.target.value}T12:00:00`).getDate());
                  }} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.cycleStartsDay')}</Label>
                  <Input type="number" min="1" max="31" value={anchorDay} onChange={e => setAnchorDay(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.invoiceSendTiming')}</Label>
                <div className="flex items-center gap-3">
                  <Input type="number" min="0" max="30" placeholder={t('legacy.useWorkspaceDefault')} value={invoiceLeadDays} onChange={e => setInvoiceLeadDays(e.target.value === '' ? '' : Number(e.target.value))} />
                  <span className="text-xs font-medium text-muted-foreground">{t('legacy.daysBeforeDueDate')}</span>
                </div>
                <p className="text-xxs text-muted-foreground">{t('legacy.leaveBlankToUseWorkspaceDefaultInvoiceTiming')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.sendAt')}</Label>
                <Input type="time" value={invoiceSendTime} onChange={e => setInvoiceSendTime(e.target.value)} />
                <p className="text-xxs text-muted-foreground">{t('legacy.leaveBlankToUseWorkspaceDefaultSendTime')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.monthlyRent')}</Label>
                  <Input type="number" value={rent} onChange={e => setRent(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-bizrent-navy dark:text-white">{t('legacy.deposit')}</Label>
                  <Input type="number" value={deposit} onChange={e => setDeposit(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
              {cyclePreview && (
                <p className="text-xs font-semibold text-bizrent-navy dark:text-white">
                  {t('legacy.firstMonthlyCycle', { label: cyclePreview.label })}
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
              {inviteTenant.isPending ? 'Processing' : 'Invite User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
