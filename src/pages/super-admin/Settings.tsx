import { useState } from "react";
import { 
  useSubscriptionTiers, 
  useUpdateSubscriptionTier, 
  formatRWF 
} from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Settings, 
  CreditCard, 
  CheckCircle2, 
  Package, 
  Save, 
  AlertCircle,
  Zap,
  Globe,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminSettings() {
  const { data: tiers, isLoading } = useSubscriptionTiers();
  const updateTier = useUpdateSubscriptionTier();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const handleEdit = (tier: any) => {
    setEditingId(tier.id);
    setEditForm({ ...tier });
  };

  const handleSave = async () => {
    if (!editForm) return;
    await updateTier.mutateAsync({ 
      id: editForm.id, 
      updates: {
        max_units: parseInt(editForm.max_units),
        max_properties: parseInt(editForm.max_properties),
        max_managers: parseInt(editForm.max_managers),
        monthly_price_rwf: parseFloat(editForm.monthly_price_rwf),
        has_whatsapp: editForm.has_whatsapp,
        has_kinyarwanda: editForm.has_kinyarwanda,
        has_api_access: editForm.has_api_access
      }
    });
    setEditingId(null);
    setEditForm(null);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Configuration</h1>
        <p className="text-slate-500 font-medium italic">Manage subscription tiers, system limits, and platform-wide feature flags.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {tiers?.map((tier) => (
          <Card key={tier.id} className={`border-none shadow-md overflow-hidden flex flex-col ${editingId === tier.id ? 'ring-2 ring-indigo-500' : ''}`}>
            <CardHeader className="bg-bizrent-light border-b border-slate-100 flex flex-row justify-between items-start">
              <div>
                <Badge variant="outline" className="mb-2 bg-indigo-50 text-indigo-700 border-indigo-200 uppercase tracking-widest text-xxs font-bold">
                  {tier.tier}
                </Badge>
                <CardTitle className="text-xl">{tier.tier} Plan</CardTitle>
              </div>
              {editingId !== tier.id ? (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(tier)}>
                  <Settings size={16} />
                </Button>
              ) : (
                <Badge className="bg-emerald-500">Editing</Badge>
              )}
            </CardHeader>

            <CardContent className="pt-6 space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><CreditCard size={14} /> Monthly Price</span>
                  {editingId === tier.id ? (
                    <div className="flex items-center gap-2 w-32 font-mono">
                      <span className="text-xxs">RWF</span>
                      <Input 
                        value={editForm?.monthly_price_rwf} 
                        onChange={(e) => setEditForm({...editForm, monthly_price_rwf: e.target.value})}
                        className="h-8 text-right"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-slate-900">{formatRWF(tier.monthly_price_rwf)}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Package size={14} /> Max Units</span>
                  {editingId === tier.id ? (
                    <Input 
                      value={editForm?.max_units} 
                      onChange={(e) => setEditForm({...editForm, max_units: e.target.value})}
                      className="h-8 w-20 text-right font-mono"
                    />
                  ) : (
                    <span className="font-semibold text-slate-700">{tier.max_units === 99999 ? 'Unlimited' : tier.max_units}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Globe size={14} /> Max Properties</span>
                  {editingId === tier.id ? (
                    <Input 
                      value={editForm?.max_properties} 
                      onChange={(e) => setEditForm({...editForm, max_properties: e.target.value})}
                      className="h-8 w-20 text-right font-mono"
                    />
                  ) : (
                    <span className="font-semibold text-slate-700">{tier.max_properties === 99999 ? 'Unlimited' : tier.max_properties}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <MessageSquare size={14} /> WhatsApp Notifications
                  </span>
                  <Switch 
                    disabled={editingId !== tier.id}
                    checked={editingId === tier.id ? editForm?.has_whatsapp : tier.has_whatsapp}
                    onCheckedChange={(checked) => setEditForm({...editForm, has_whatsapp: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Kinyarwanda Support
                  </span>
                  <Switch 
                    disabled={editingId !== tier.id}
                    checked={editingId === tier.id ? editForm?.has_kinyarwanda : tier.has_kinyarwanda}
                    onCheckedChange={(checked) => setEditForm({...editForm, has_kinyarwanda: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Zap size={14} /> Developer API
                  </span>
                  <Switch 
                    disabled={editingId !== tier.id}
                    checked={editingId === tier.id ? editForm?.has_api_access : tier.has_api_access}
                    onCheckedChange={(checked) => setEditForm({...editForm, has_api_access: checked})}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/30 border-t border-slate-100 pt-4 space-x-2">
              {editingId === tier.id ? (
                <>
                  <Button variant="default" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={updateTier.isPending}>
                    {updateTier.isPending ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} className="mr-2"/> Save Changes</>}
                  </Button>
                  <Button variant="outline" className="w-fit px-3" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <div className="text-xxs text-slate-400 flex items-center italic gap-1">
                  <AlertCircle size={10} /> Limits automatically synced to organization RLS functions
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
