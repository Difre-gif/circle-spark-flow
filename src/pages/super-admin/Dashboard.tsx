import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp,
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformStats, usePendingOrganisations, formatRWF } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = usePlatformStats();
  const { data: pending, isLoading: loadingPending } = usePendingOrganisations();

  const dashboardStats = [
    { 
      title: "Total Volume", 
      value: loadingStats ? "..." : formatRWF(stats?.totalVolume || 0), 
      change: "+12%", 
      icon: CreditCard,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    { 
      title: "Organizations", 
      value: loadingStats ? "..." : stats?.orgCount.toString(), 
      change: "+3", 
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    { 
      title: "Platform Users", 
      value: loadingStats ? "..." : stats?.userCount.toString(), 
      change: "+8", 
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    { 
      title: "Active Units", 
      value: loadingStats ? "..." : stats?.unitCount.toString(), 
      change: "+5", 
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 font-medium">
          Good morning, <span className="text-indigo-600 font-semibold">{user?.name}</span>. Here's a snapshot of the BizRent ecosystem.
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
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity / System Integrity */}
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Live health checks across services</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 italic text-slate-400">
            Performance metrics gathering in progress...
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="lg:col-span-3 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Launch requests from new landlords</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8">View All</Button>
          </CardHeader>
          <CardContent className="px-0">
            {loadingPending ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : !pending || pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">All clear!</p>
                  <p className="text-sm text-slate-500 mt-1">No new organizations are waiting for approval at this time.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.slice(0, 5).map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{org.name}</span>
                      <span className="text-xs text-slate-500">{new Date(org.created_at).toLocaleDateString()}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/super-admin/organizations" className="text-indigo-600 font-medium">Review</Link>
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
