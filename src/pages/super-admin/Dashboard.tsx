import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp,
  Clock,
  Loader2,
  Percent,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalAdminMetrics, usePendingOrganisations, formatRWF } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: metrics, isLoading: loadingMetrics } = useGlobalAdminMetrics();
  const { data: pending, isLoading: loadingPending } = usePendingOrganisations();

  const dashboardStats = [
    { 
      title: "Monthly Recurring Revenue", 
      value: loadingMetrics ? "..." : formatRWF(metrics?.mrr || 0), 
      change: `+${metrics?.platform_growth_pct || 0}%`, 
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      description: "Active subscriptions MRR"
    },
    { 
      title: "Collection Rate", 
      value: loadingMetrics ? "..." : `${metrics?.collection_rate}%`, 
      change: "Stable", 
      icon: Percent,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      description: "Approved vs total due"
    },
    { 
      title: "Active Organizations", 
      value: loadingMetrics ? "..." : metrics?.active_orgs.toString(), 
      change: `+${metrics?.pending_orgs || 0} pending`, 
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-50",
      description: "Live landlord workspaces"
    },
    { 
      title: "Managed Inventory", 
      value: loadingMetrics ? "..." : metrics?.total_units.toString(), 
      change: "Units", 
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-50",
      description: "Total units on platform"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase tracking-widest flex items-center gap-3">
          <div className="h-8 w-2 bg-bizrent-navy rounded-full" />
          {t('legacy.missionControl')}
        </h1>
        <p className="text-muted-foreground font-medium">
          Welcome back, <span className="text-indigo-600 font-semibold">{user?.name}</span>. Platform integrity is <span className="text-emerald-600 font-bold uppercase tracking-tighter">{t('legacy.nominal')}</span>.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-xxs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  <TrendingUp size={12} />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{stat.value}</h3>
                <p className="text-xxs text-muted-foreground font-medium mt-1 uppercase tracking-tight">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity / System Integrity */}
        <Card className="lg:col-span-4 border-none shadow-md overflow-hidden group">
          <CardHeader className="bg-slate-900 text-white pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{t('legacy.infrastructurePulse')}</CardTitle>
                <CardDescription className="text-muted-foreground">{t('legacy.realTimeServiceAvailability')}</CardDescription>
              </div>
              <Activity className="text-emerald-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t border-border">
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
              {[
                { label: "API Gateway", status: "Healthy", check: "99.98% Uptime" },
                { label: "Auth Service", status: "Healthy", check: "Zero Latency" },
                { label: "Postgres Cluster", status: "Nominal", check: "32ms Avg Query" },
                { label: "Storage Buckets", status: "Healthy", check: "S3 Mirror Active" },
              ].map((service, i) => (
                <div key={i} className="p-6 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{service.label}</span>
                    <span className="text-xxs font-black text-emerald-600 uppercase italic">{service.status}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{service.check}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="lg:col-span-3 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">{t('legacy.activationQueue')}</CardTitle>
              <CardDescription>{t('legacy.newLandlordRegistrations')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xxs h-7 font-black uppercase tracking-widest border-border">
              <Link to="/super-admin/organizations">{t('legacy.manageAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {loadingPending ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : !pending || pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
                <div className="h-14 w-14 bg-muted/40 rounded-2xl flex items-center justify-center text-slate-300 transform rotate-3">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="font-bold text-foreground uppercase tracking-tight">{t('legacy.queueClear')}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{t('legacy.allPendingOrganizationsHaveBeenProcessed')}</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.slice(0, 5).map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-5 hover:bg-muted/80 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs group-hover:scale-110 transition-transform">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground truncate max-w-[140px]">{org.name}</span>
                        <span className="text-xxs text-muted-foreground font-bold uppercase tracking-widest">{new Date(org.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white border-indigo-100 font-bold text-xs px-4 shadow-sm transition-all">
                      <Link to="/super-admin/organizations">{t('legacy.review')}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
