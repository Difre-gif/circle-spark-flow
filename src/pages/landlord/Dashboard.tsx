import { ArrowRightLeft, Send, Wallet, Activity, TrendingUp, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useDashboardStats, usePayments, useOccupancySummary, useOrganisation, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LandlordDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPayments, isLoading: paymentsLoading } = usePayments();
  const { data: occupancy } = useOccupancySummary();
  const { data: org } = useOrganisation();

  const isLoading = statsLoading || paymentsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;
  }

  // Mocking past 6 months data for the visual chart based on template
  const mockChartData = [
    { month: 'Jan', collected: 200, outstanding: 150 },
    { month: 'Feb', collected: 250, outstanding: 120 },
    { month: 'Mar', collected: 220, outstanding: 180 },
    { month: 'Apr', collected: 300, outstanding: 100 },
    { month: 'May', collected: 280, outstanding: 140 },
    { month: 'Jun', collected: 320, outstanding: 80 },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bizrent-navy">Good morning, {org?.name || 'Landlord'}</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Stay on top of your properties, monitor payments, and track status.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Outstanding Balance Widget */}
          <Card className="rounded-3xl border-0 card-shadow bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-semibold text-muted-foreground">Total Outstanding Rent</p>
                <div className="bg-muted px-3 py-1 rounded-full text-xs font-bold text-bizrent-navy flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-bizrent-red"></span> RWF
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-bizrent-navy tracking-tight">{formatRWF(stats?.outstanding ?? 0)}</h2>
              <p className="text-sm font-medium text-bizrent-red mt-2 bg-bizrent-red/10 inline-block px-2 py-0.5 rounded-md">
                Requires Attention
              </p>
              
              <div className="flex gap-3 mt-8">
                <Button className="flex-1 rounded-xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white font-semibold h-12 shadow-md">
                  <Send className="mr-2 h-4 w-4" /> Send Reminders
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl border-border/60 hover:bg-muted font-semibold h-12">
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Collect Rent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Properties / Wallets Widget */}
          <Card className="rounded-3xl border-0 card-shadow bg-white">
            <CardHeader className="pb-2 pt-6 px-6 flex flex-row justify-between items-center">
              <CardTitle className="text-base font-bold text-bizrent-navy">Top Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="space-y-4">
                {(occupancy ?? []).slice(0, 3).map((prop, idx) => (
                  <div key={prop.property_id} className="flex items-center justify-between p-3 rounded-2xl border border-border/40 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                        ${idx === 0 ? 'bg-bizrent-navy text-white' : idx === 1 ? 'bg-bizrent-emerald text-white' : 'bg-bizrent-blue text-white'}`}>
                        {prop.property_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-bizrent-navy truncate max-w-[120px]">{prop.property_name}</p>
                        <p className="text-xs text-muted-foreground">{prop.occupied_units}/{prop.total_units} Occupied</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-bizrent-navy">{prop.occupancy_rate_pct}%</p>
                      <p className="text-[10px] font-semibold text-bizrent-emerald">Active</p>
                    </div>
                  </div>
                ))}
                {(!occupancy || occupancy.length === 0) && (
                  <p className="text-sm text-center text-muted-foreground py-4">No properties tracked</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* MoMo Cards Widget */}
          <Card className="rounded-3xl border-0 card-shadow bg-white overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center pb-2 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Payment Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {/* Primary MoMo Card (BizRent Amber/Yellow to mimic MTN MoMo) */}
              <div className="bg-bizrent-amber rounded-2xl p-5 shadow-lg relative overflow-hidden text-bizrent-navy">
                <div className="absolute -right-4 -top-4 opacity-20">
                  <div className="w-24 h-24 rounded-full border-4 border-bizrent-navy"></div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest">MTN Mobile Money</p>
                  <Activity className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-sm font-semibold opacity-90 mb-1">Merchant Code</p>
                <p className="text-3xl font-mono font-bold tracking-widest">{org?.momo_merchant_number || '000000'}</p>
                <div className="mt-4 flex justify-between items-end text-xs font-bold opacity-80">
                  <p>{org?.name}</p>
                  <p className="px-2 py-1 bg-bizrent-navy text-white rounded-md text-[10px]">ACTIVE</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Top Row: 4 Stats + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* 4 Colored Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {/* Highlight Stat (Amber) */}
              <div className="bg-bizrent-amber rounded-3xl p-5 flex flex-col justify-center shadow-sm text-bizrent-navy">
                <p className="text-xs font-bold opacity-80 mb-2">Pending Payments</p>
                <h3 className="text-3xl font-extrabold">{stats?.pendingPayments ?? 0}</h3>
                <p className="text-[10px] font-bold mt-2 bg-bizrent-navy/10 self-start px-2 py-1 rounded-md">
                  Requires Review
                </p>
              </div>
              
              {/* White Stat 1 */}
              <div className="bg-white rounded-3xl p-5 flex flex-col justify-center card-shadow border border-border/30">
                <p className="text-xs font-bold text-muted-foreground mb-2">Collection Rate</p>
                <h3 className="text-3xl font-extrabold text-bizrent-navy">{stats?.collectionRate ?? 0}%</h3>
                <p className="text-[10px] font-bold mt-2 text-bizrent-emerald flex items-center bg-bizrent-emerald/10 self-start px-2 py-1 rounded-md">
                  ↑ This month
                </p>
              </div>

              {/* White Stat 2 */}
              <div className="bg-white rounded-3xl p-5 flex flex-col justify-center card-shadow border border-border/30">
                <p className="text-xs font-bold text-muted-foreground mb-2">Occupied Units</p>
                <h3 className="text-3xl font-extrabold text-bizrent-navy">{stats?.occupiedUnits ?? 0}</h3>
                <p className="text-[10px] font-bold mt-2 text-bizrent-emerald flex items-center bg-bizrent-emerald/10 self-start px-2 py-1 rounded-md">
                  out of {stats?.totalUnits ?? 0}
                </p>
              </div>

              {/* White Stat 3 */}
              <div className="bg-white rounded-3xl p-5 flex flex-col justify-center card-shadow border border-border/30">
                <p className="text-xs font-bold text-muted-foreground mb-2">Vacant Units</p>
                <h3 className="text-3xl font-extrabold text-bizrent-navy">{stats?.vacantUnits ?? 0}</h3>
                <p className="text-[10px] font-bold mt-2 text-bizrent-red flex items-center bg-bizrent-red/10 self-start px-2 py-1 rounded-md">
                  Lost Revenue
                </p>
              </div>
            </div>

            {/* Collections Chart */}
            <Card className="lg:col-span-3 rounded-3xl border-0 card-shadow bg-white">
              <CardHeader className="pb-0 pt-6 px-6">
                <CardTitle className="text-base font-bold text-bizrent-navy">Revenue Overview</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">View your collections over the last 6 months</p>
              </CardHeader>
              <CardContent className="px-6 pt-6 pb-2">
                <div className="flex justify-end gap-4 mb-4 text-xs font-bold">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-bizrent-blue"></span> Collected</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-bizrent-slate"></span> Outstanding</div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="collected" stackId="a" fill="hsl(222 72% 48%)" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="outstanding" stackId="a" fill="hsl(222 47% 11%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Recent Activities Table */}
          <Card className="rounded-3xl border-0 card-shadow bg-white flex-1">
            <CardHeader className="flex flex-row justify-between items-center pb-4 pt-6 px-8 border-b border-border/40">
              <CardTitle className="text-base font-bold text-bizrent-navy">Recent Activities</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Search" className="pl-9 pr-4 py-1.5 text-sm rounded-full bg-muted/50 border-none outline-none focus:ring-2 focus:ring-bizrent-navy/20 transition-all w-32 md:w-48" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted"><Download className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                      <th className="text-left px-8 py-4 whitespace-nowrap">Transaction ID</th>
                      <th className="text-left px-4 py-4">Tenant</th>
                      <th className="text-left px-4 py-4">Amount</th>
                      <th className="text-left px-4 py-4">Status</th>
                      <th className="text-left px-8 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recentPayments ?? []).slice(0, 6).map((p, idx) => (
                      <tr key={p.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors group">
                        <td className="px-8 py-4">
                          <code className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-md text-bizrent-navy font-bold group-hover:bg-white transition-colors">
                            {p.transaction_id || `TXN_${idx}00${idx}`}
                          </code>
                        </td>
                        <td className="px-4 py-4 font-bold text-bizrent-navy whitespace-nowrap">
                          {(p.tenant as any)?.full_name ?? '—'}
                        </td>
                        <td className="px-4 py-4 font-semibold text-bizrent-slate whitespace-nowrap">
                          {formatRWF(p.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              p.status === 'APPROVED' ? 'bg-bizrent-emerald' : 
                              p.status === 'PENDING' ? 'bg-bizrent-amber' : 
                              'bg-bizrent-red'
                            }`}></span>
                            <span className="font-semibold text-xs text-muted-foreground capitalize">
                              {p.status.toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-muted-foreground font-medium whitespace-nowrap">
                          {formatDate(p.submitted_at)}
                        </td>
                      </tr>
                    ))}
                    {(!recentPayments || recentPayments.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">
                          No recent activities found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}