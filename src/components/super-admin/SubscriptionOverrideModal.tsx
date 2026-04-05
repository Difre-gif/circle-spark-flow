import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  useOrgSubscription, 
  useSubscriptionTiers, 
  useUpdateOrgSubscription,
  formatRWF 
} from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldAlert, CreditCard, Calendar, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionOverrideModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  orgName: string;
}

export function SubscriptionOverrideModal({ 
  isOpen, 
  onOpenChange, 
  orgId, 
  orgName 
}: SubscriptionOverrideModalProps) {
  const { data: subscription, isLoading: loadingSub } = useOrgSubscription(orgId);
  const { data: tiers, isLoading: loadingTiers } = useSubscriptionTiers();
  const updateMutation = useUpdateOrgSubscription();

  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [trialEndsAt, setTrialEndsAt] = useState<string>("");

  useEffect(() => {
    if (subscription) {
      setSelectedTier(subscription.tier);
      setSelectedStatus(subscription.status);
      setTrialEndsAt(subscription.trial_ends_at?.split('T')[0] || "");
    }
  }, [subscription, isOpen]);

  const handleSave = async () => {
    const updates: any = {
      tier: selectedTier,
      status: selectedStatus,
    };

    if (trialEndsAt) {
      updates.trial_ends_at = new Date(trialEndsAt).toISOString();
    }

    // Capture the price from the selected tier
    const tierDetails = tiers?.find(t => t.tier === selectedTier);
    if (tierDetails) {
      updates.amount = tierDetails.monthly_price_rwf;
    }

    await updateMutation.mutateAsync({ orgId, updates });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-none shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Zap size={20} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Financial Override</DialogTitle>
              <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                Control Panel: {orgName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loadingSub || loadingTiers ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing platform ledgers...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                GOD-MODE NOTICE: These changes bypass standard payment gateways. All manual overrides are logged for co-founder review.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Subscription Tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="rounded-xl h-12 border-slate-100 font-bold text-slate-900 bg-slate-50/50">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {tiers?.map((t) => (
                      <SelectItem key={t.id} value={t.tier} className="rounded-lg font-bold">
                        {t.tier} - {formatRWF(t.monthly_price_rwf)}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Status Override</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="rounded-xl h-12 border-slate-100 font-bold text-slate-900 bg-slate-50/50">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="TRIAL" className="rounded-lg font-bold text-blue-600">Active Trial</SelectItem>
                    <SelectItem value="ACTIVE" className="rounded-lg font-bold text-emerald-600">Paid Active</SelectItem>
                    <SelectItem value="PAST_DUE" className="rounded-lg font-bold text-red-600">Past Due</SelectItem>
                    <SelectItem value="CANCELLED" className="rounded-lg font-bold text-slate-400">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Trial/Period End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  type="date"
                  className="pl-12 h-12 rounded-xl border-slate-100 font-bold text-slate-900 bg-slate-50/50"
                  value={trialEndsAt}
                  onChange={(e) => setTrialEndsAt(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Authorization</span>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-none px-2 py-0.5 rounded-lg font-black text-[9px] uppercase">Super Admin Override</Badge>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <CreditCard className="text-slate-400" size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 italic">Financial Handshake Required</span>
                  <span className="text-[10px] font-bold text-slate-400">Database rows will be modified directly upon save.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-3 mt-4">
          <Button variant="ghost" className="rounded-xl font-bold h-12 px-6" onClick={() => onOpenChange(false)}>
            Abort
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black h-12 px-8 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            onClick={handleSave}
            disabled={updateMutation.isPending || !selectedTier || !selectedStatus}
          >
            {updateMutation.isPending ? "Rewriting Ledger..." : "Authorize Override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
