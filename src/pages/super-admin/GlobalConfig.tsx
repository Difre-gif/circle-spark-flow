import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, Save, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  description: string;
  updated_at: string;
}

export default function GlobalConfig() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edited, setEdited] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .order('key');
    if (!error && data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (setting: PlatformSetting) => {
    const newVal = edited[setting.key] ?? setting.value;
    setSaving(setting.key);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: newVal, updated_at: new Date().toISOString() })
      .eq('id', setting.id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${setting.key}" updated`);
    setEdited(prev => { const n = {...prev}; delete n[setting.key]; return n; });
    fetchSettings();
  };

  const toggleBoolean = async (setting: PlatformSetting) => {
    const newVal = setting.value === 'true' ? 'false' : 'true';
    setSaving(setting.key);
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: newVal, updated_at: new Date().toISOString() })
      .eq('id', setting.id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${setting.key}" set to ${newVal}`);
    fetchSettings();
  };

  const dangerKeys = ['maintenance_mode', 'allow_new_registrations'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Settings className="text-indigo-600" size={32} />
          Global Platform Configuration
        </h1>
        <p className="text-slate-500 font-medium italic">Platform-wide feature flags and operational controls — changes take effect immediately.</p>
      </div>

      <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-900 p-8 pb-6">
          <CardTitle className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            <div className="h-4 w-1 bg-indigo-400 rounded-full" />
            System Controls
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium italic">All changes are logged in the Sovereign Audit Trail.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={36} />
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => {
                const isDanger = dangerKeys.includes(setting.key);
                const currentVal = edited[setting.key] ?? setting.value;
                const isActive = setting.value === 'true';

                return (
                  <div
                    key={setting.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border transition-all ${isDanger ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-white'} shadow-sm`}
                  >
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 font-mono text-sm">{setting.key}</span>
                        {isDanger && (
                          <Badge className="bg-amber-500 text-white border-none text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md tracking-tighter gap-1">
                            <AlertTriangle size={8} /> High Impact
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-slate-400 border-slate-100 text-[8px] uppercase tracking-widest font-black">{setting.type}</Badge>
                      </div>
                      <p className="text-slate-500 text-xs font-medium">{setting.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {setting.type === 'boolean' ? (
                        <button
                          onClick={() => toggleBoolean(setting)}
                          disabled={saving === setting.key}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {saving === setting.key ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isActive ? (
                            <ToggleRight size={20} />
                          ) : (
                            <ToggleLeft size={20} />
                          )}
                          {isActive ? 'ON' : 'OFF'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentVal}
                            onChange={(e) => setEdited(prev => ({ ...prev, [setting.key]: e.target.value }))}
                            className="w-28 h-10 rounded-xl border-slate-200 text-center font-bold text-lg"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSave(setting)}
                            disabled={saving === setting.key || currentVal === setting.value}
                            className="h-10 rounded-xl font-bold px-4 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                          >
                            {saving === setting.key ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
