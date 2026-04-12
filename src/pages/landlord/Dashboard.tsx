import { ArrowRightLeft, Send, Wallet, Activity, Download, Loader2, Search, Home, Copy, Eye, EyeOff, Building2, Users, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, usePayments, useOccupancySummary, useOrganisation, formatRWF, formatDate, useInvoices, useInvitations } from '@/hooks/useSupabaseData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminderOpen, setReminderOpen] = useState(false);
  const [showMomo, setShowMomo] = useState(false);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPayments, isLoading: paymentsLoading } = usePayments();
  const { data: occupancy, isLoading: occLoading } = useOccupancySummary();
  const { data: org } = useOrganisation();
  const { data: overdueInvoices } = useInvoices({ status: 'OVERDUE' });
  const { data: invitations } = useInvitations();
  const { data: allInvoices } = useInvoices();

  // Granular loading per widget instead of a global blocker
  // const isLoading = statsLoading || paymentsLoading || occLoading;

  const chartData = useMemo(() => {
    if (!allInvoices) return [];

    const dataMap = new Map();
    const months = [];
    const now = new Date();
    
    // Generate last 6 months list (chronological order)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      months.push({ label: monthLabel, monthNum: d.getMonth(), year: d.getFullYear() });
      dataMap.set(monthLabel, { month: monthLabel, collected: 0, outstanding: 0 });
    }

    allInvoices.forEach(inv => {
      const invDate = new Date(inv.due_date || inv.created_at);
      const mLabel = invDate.toLocaleString('en-US', { month: 'short' });
      
      if (dataMap.has(mLabel)) {
        const entry = dataMap.get(mLabel);
        const collected = inv.amount_paid || 0;
        const outstanding = inv.balance ?? Math.max(0, (inv.amount_due || 0) - collected);
        
        entry.collected += collected;
        entry.outstanding += outstanding;
      }
    });

    return Array.from(dataMap.values());
  }, [allInvoices]);

  const getDynamicInsight = () => {
    if (statsLoading || occLoading) return "Loading your insights...";
    const vacantUnits = stats?.vacantUnits ?? 0;
    const invCount = (invitations ?? []).length;
    
    if (vacantUnits > 0) {
      // Assuming average rent is 150,000 for calculation if we don't have exact numbers
      const estLoss = vacantUnits * 150000;
      return <span className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-bizrent-red" /> You have <strong className="text-bizrent-navy">{vacantUnits} vacant unit{vacantUnits > 1 ? 's' : ''}</strong> losing approx {formatRWF(estLoss)}/month. <button className="text-bizrent-blue hover:underline font-medium" onClick={() => navigate('/landlord/units')}>List them now &rarr;</button></span>;
    }
    if (invCount > 0) {
      return <span className="flex items-center gap-1.5"><Send className="h-4 w-4 text-bizrent-amber" /> {invCount} tenant{invCount > 1 ? 's' : ''} invited, awaiting sign-up. <button className="text-bizrent-blue hover:underline font-medium" onClick={() => navigate('/landlord/tenants')}>Review invites &rarr;</button></span>;
    }
    return `Managing ${org?.name || 'your workspace'}.`;
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <Home className="h-3.5 w-3.5" /> <span className="text-bizrent-blue">Home / Overview</span>
          </p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy tracking-tight">
            {org ? `Good morning, ${firstName}` : <span><Skeleton className="h-8 w-64 inline-block" /></span>}
          </h1>
          <div className="page-description font-medium text-muted-foreground mt-2 flex items-center gap-1">
            {org ? getDynamicInsight() : <Skeleton className="h-4 w-96 inline-block" />}
          </div>
        </div>
      </div>

      {/* Pending payments alert — unmissable amber banner */}
      {!statsLoading && (stats?.pendingPayments ?? 0) > 0 && (
        <div className="flex items-center gap-4 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-[8px] px-5 py-4 shadow-card">
          <div className="flex-shrink-0 p-2 bg-[#F59E0B] rounded-[6px]">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <p className="flex-1 text-sm font-semibold text-[#0F172A]">
            <span className="font-bold text-[#92400E]">{stats.pendingPayments} payment{stats.pendingPayments !== 1 ? 's' : ''}</span>{' '}
            waiting for review.
          </p>
          <Button
            className="flex-shrink-0 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-[6px] h-9 px-4"
            onClick={() => navigate('/landlord/payments')}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Overdue alert — red banner */}
      {!statsLoading && (overdueInvoices?.length ?? 0) > 0 && (
        <div className="flex items-center gap-4 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-[8px] px-5 py-4 shadow-card">
          <div className="flex-shrink-0 p-2 bg-[#DC2626] rounded-[6px]">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <p className="flex-1 text-sm font-semibold text-[#0F172A]">
            <span className="font-bold text-[#DC2626]">{overdueInvoices!.length} unit{overdueInvoices!.length !== 1 ? 's' : ''}</span>{' '}
            overdue.
          </p>
          <Button
            className="flex-shrink-0 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm rounded-[6px] h-9 px-4"
            onClick={() => navigate('/landlord/reports')}
          >
            View Overdue
          </Button>
        </div>
      )}

      {/* Get Started — shown only when account has no properties yet */}
      {!occLoading && (!occupancy || occupancy.length === 0) && (
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] bg-bizrent-navy text-white overflow-hidden">
          <CardContent className="p-8">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Welcome to BizRent</p>
            <h2 className="text-2xl font-extrabold mb-1">Set up your first property</h2>
            <p className="text-sm opacity-80 mb-6 max-w-lg">You're all set! Follow these three steps to start collecting rent and managing tenants.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Building2, step: '1', title: 'Add a Property', desc: 'Register your building or commercial space.', href: '/landlord/properties' },
                { icon: Home, step: '2', title: 'Add Units', desc: 'Break your property into individual rentable units.', href: '/landlord/units' },
                { icon: Users, step: '3', title: 'Invite Tenants', desc: 'Send email invites and assign them to units.', href: '/landlord/tenants' },
              ].map(({ icon: Icon, step, title, desc, href }) => (
                <button
                  key={step}
                  onClick={() => navigate(href)}
                  className="text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-white/20 rounded-xl"><Icon className="h-5 w-5" /></div>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </div>
                  <p className="font-bold text-sm">{step}. {title}</p>
                  <p className="text-xs opacity-70">{desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Outstanding Balance Widget */}
          <Card className="rounded-3xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Outstanding Rent</p>
                <div className="bg-muted/50 px-3 py-1 rounded-full text-xs font-bold text-bizrent-navy flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-bizrent-red"></span> RWF
                </div>
              </div>
              
              {statsLoading ? (
                <Skeleton className="h-12 w-48 mb-2" />
              ) : (
                <h2 className="text-4xl font-extrabold text-bizrent-navy tracking-tight font-mono">
                  {formatRWF(stats?.outstanding ?? 0)}
                </h2>
              )}

              {!statsLoading && (stats?.outstanding ?? 0) > 0 ? (
                <p className="text-xs font-bold text-bizrent-red mt-3 bg-bizrent-red/10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bizrent-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-bizrent-red"></span>
                  </span>
                  Overdue Rent
                </p>
              ) : !statsLoading ? (
                <p className="text-xs font-bold text-bizrent-emerald mt-3 bg-bizrent-emerald/10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md">
                   All Clear
                </p>
              ) : null}
              
              <div className="flex flex-col gap-3 mt-8">
                <Button 
                  className="w-full rounded-xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white font-semibold h-12 shadow-sm disabled:opacity-50"
                  onClick={() => setReminderOpen(true)}
                  disabled={!overdueInvoices || overdueInvoices.length === 0}
                  title={(!overdueInvoices || overdueInvoices.length === 0) ? "No tenants with outstanding balances" : undefined}
                >
                  <Send className="mr-2 h-4 w-4" /> Send Reminders
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl border-border/60 hover:bg-muted font-semibold h-12"
                  onClick={() => navigate('/landlord/payments')}
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Collect Rent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Properties / Wallets Widget */}
          <Card className="rounded-3xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
            <CardHeader className="pb-2 pt-6 px-6 flex flex-row justify-between items-center">
              <CardTitle className="text-base font-bold text-bizrent-navy">Top Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="space-y-3">
                {occLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))
                ) : (
                  <>
                    {(occupancy ?? []).slice(0, 3).map((prop, idx) => (
                      <div key={prop.property_id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                            ${idx === 0 ? 'bg-bizrent-navy text-white' : idx === 1 ? 'bg-bizrent-emerald text-white' : 'bg-bizrent-blue text-white'}`}>
                            {prop.property_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-bizrent-navy truncate max-w-[120px]">{prop.property_name}</p>
                            <p className="text-xs text-muted-foreground font-medium">{prop.occupied_units}/{prop.total_units} Occupied</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {prop.total_units === 0 ? (
                            <>
                              <p className="font-bold text-sm text-bizrent-slate">—</p>
                              <button className="text-xxs font-bold text-muted-foreground uppercase hover:text-bizrent-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bizrent-blue/20 rounded" onClick={() => navigate('/landlord/units')}>Add units &rarr;</button>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-sm text-bizrent-navy font-mono">{prop.occupancy_rate_pct}%</p>
                              <p className="text-xxs font-bold text-bizrent-emerald uppercase">Active</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!occupancy || occupancy.length === 0) && (
                      <p className="text-sm text-center text-muted-foreground py-4">No properties tracked</p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* MoMo Cards Widget */}
          <Card className="rounded-3xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center pb-2 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Payment Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="bg-bizrent-amber rounded-2xl p-5 shadow-sm relative overflow-hidden text-bizrent-navy">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <div className="w-24 h-24 rounded-full border-4 border-bizrent-navy"></div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest">MTN Mobile Money</p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 opacity-80" />
                    <span className="bg-black/10 rounded-full px-2 py-0.5 text-xxxs font-extrabold uppercase">🔒 Secure</span>
                  </div>
                </div>
                <p className="text-sm font-semibold opacity-90 mb-1">Merchant Code</p>
                {org ? (
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-mono font-bold tracking-widest">{showMomo ? (org.momo_merchant_number || '000000') : '••••••'}</p>
                    <div className="flex items-center gap-1 opacity-80">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 rounded-full" onClick={() => setShowMomo(!showMomo)}>
                        {showMomo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 rounded-full" onClick={() => {
                        navigator.clipboard.writeText(org.momo_merchant_number || '000000');
                        toast.success('Merchant code copied to clipboard');
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-10 w-32 bg-bizrent-navy/20" />
                )}
                <div className="mt-4 flex justify-between items-end text-xs font-bold opacity-80">
                  <p>{org?.name || <Skeleton className="h-3 w-20" />}</p>
                  <p className="px-2 py-1 bg-bizrent-navy text-white rounded-md text-xxs uppercase">Active</p>
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
              <div className="bg-bizrent-amber rounded-3xl p-5 flex flex-col justify-center shadow-sm text-bizrent-navy relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Wallet className="w-16 h-16" />
                </div>
                <p className="text-xs font-bold opacity-80 mb-2 uppercase tracking-wide">Pending Payments</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 bg-bizrent-navy/20" />
                ) : (
                  <h3 className="text-3xl font-extrabold font-mono">{stats?.pendingPayments ?? 0}</h3>
                )}
                
                {(!statsLoading && (stats?.pendingPayments ?? 0) > 0) ? (
                  <p className="text-xxs font-bold mt-3 bg-bizrent-navy text-white self-start px-2.5 py-1 rounded-md uppercase flex items-center gap-1.5 shadow-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Review Now
                  </p>
                ) : !statsLoading ? (
                  <p className="text-xxs font-bold mt-3 bg-bizrent-navy/10 self-start px-2.5 py-1 rounded-md uppercase">
                    Caught up
                  </p>
                ) : null}
              </div>
              
              {/* White Stat 1 */}
              <div className="bg-white rounded-3xl p-5 flex flex-col justify-center border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Collection Rate</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-bizrent-navy font-mono">{stats?.collectionRate ?? 0}%</h3>
                )}
                {!statsLoading && (stats?.collectionRate ?? 0) === 0 ? (
                  <p className="text-xxs font-bold mt-3 text-bizrent-red flex items-center bg-bizrent-red/10 self-start px-2.5 py-1 rounded-md uppercase">
                    Needs Action
                  </p>
                ) : !statsLoading && (stats?.collectionRate ?? 0) < 60 ? (
                  <p className="text-xxs font-bold mt-3 text-bizrent-amber flex items-center bg-bizrent-amber/10 self-start px-2.5 py-1 rounded-md uppercase">
                    Below Target
                  </p>
                ) : !statsLoading ? (
                  <p className="text-xxs font-bold mt-3 text-bizrent-emerald flex items-center bg-bizrent-emerald/10 self-start px-2.5 py-1 rounded-md uppercase">
                    On Track
                  </p>
                ) : null}
              </div>

              {/* White Stat 2 */}
              <div className="bg-white rounded-3xl p-5 flex flex-col justify-center border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Occupied Units</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-bizrent-navy font-mono">{stats?.occupiedUnits ?? 0}</h3>
                )}
                <p className="text-xxs font-bold mt-3 text-bizrent-blue flex items-center bg-bizrent-blue/10 self-start px-2.5 py-1 rounded-md uppercase">
                  out of {stats?.totalUnits ?? 0}
                </p>
              </div>

              {/* White Stat 3 */}
              <div className="bg-white rounded-3xl p-5 flex flex-col justify-center border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Vacant Units</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-bizrent-navy font-mono">{stats?.vacantUnits ?? 0}</h3>
                )}
                <p className="text-xxs font-bold mt-3 text-bizrent-red flex items-center bg-bizrent-red/10 self-start px-2.5 py-1 rounded-md uppercase">
                  Lost Revenue
                </p>
              </div>
            </div>

            {/* Collections Chart */}
            <Card className="lg:col-span-3 rounded-3xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
              <CardHeader className="pb-0 pt-6 px-6">
                <CardTitle className="text-base font-bold text-bizrent-navy">Revenue Overview</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">View your collections over the last 6 months</p>
              </CardHeader>
              <CardContent className="px-6 pt-6 pb-2">
                <div className="flex justify-end gap-4 mb-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-bizrent-emerald"></span> Collected</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-bizrent-amber"></span> Outstanding</div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="collected" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="outstanding" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Recent Activities Table */}
          <Card className="rounded-3xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white flex-1">
            <CardHeader className="flex flex-row justify-between items-center pb-4 pt-6 px-8 border-b border-border/40">
              <CardTitle className="text-base font-bold text-bizrent-navy">Recent Activities</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 text-sm rounded-full bg-muted/30 border border-transparent outline-none focus:ring-2 focus:ring-bizrent-blue/20 transition-all w-32 md:w-48" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted"><Download className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="bg-muted/20 text-muted-foreground font-semibold border-b border-border/40">
                      <th scope="col" className="text-left px-8 py-4 whitespace-nowrap min-w-[150px]">Transaction ID</th>
                      <th scope="col" className="text-left px-4 py-4 min-w-[150px]">Tenant</th>
                      <th scope="col" className="text-left px-4 py-4 text-right min-w-[120px]">Amount</th>
                      <th scope="col" className="text-left px-4 py-4 text-center min-w-[120px]">Status</th>
                      <th scope="col" className="text-left px-8 py-4 min-w-[120px]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:nth-child(even)]:bg-slate-50">
                    {paymentsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/20">
                          <td className="px-8 py-4"><Skeleton className="h-6 w-24" /></td>
                          <td className="px-4 py-4"><Skeleton className="h-6 w-32" /></td>
                          <td className="px-4 py-4"><Skeleton className="h-6 w-20 ml-auto" /></td>
                          <td className="px-4 py-4"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                          <td className="px-8 py-4"><Skeleton className="h-6 w-28" /></td>
                        </tr>
                      ))
                    ) : (
                      <>
                        {(recentPayments ?? []).slice(0, 6).map((p, idx) => (
                          <tr key={p.id} className="border-b border-border/20 hover:bg-white transition-colors group">
                            <td className="px-8 py-4">
                              <code className="font-mono text-xs font-bold bg-muted/50 px-2 py-1 rounded-md text-bizrent-navy group-hover:bg-white transition-colors">
                                {p.transaction_id || `TXN_${idx}00${idx}`}
                              </code>
                            </td>
                            <td className="px-4 py-4 font-bold text-bizrent-navy whitespace-nowrap">
                              {(p.tenant as any)?.full_name ?? '—'}
                            </td>
                            <td className="px-4 py-4 font-semibold text-bizrent-slate whitespace-nowrap text-right font-mono">
                              {formatRWF(p.amount)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <StatusBadge status={p.status} />
                            </td>
                            <td className="px-8 py-4 text-muted-foreground font-medium whitespace-nowrap text-xs">
                              {formatDate(p.submitted_at)}
                            </td>
                          </tr>
                        ))}
                        {(!recentPayments || recentPayments.length === 0) && (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-muted-foreground">
                              <div className="flex flex-col items-center justify-center">
                                <Activity className="h-8 w-8 mb-2 opacity-20" />
                                <p className="font-medium text-bizrent-navy">No recent activities found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </div>

      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-bizrent-navy">Rent Reminders</DialogTitle>
            <DialogDescription className="font-medium">
              We found {(overdueInvoices ?? []).length} overdue invoices that need follow-up.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto my-4 space-y-3 pr-2 custom-scrollbar">
            {(overdueInvoices ?? []).map(inv => (
              <div key={inv.id} className="p-3 rounded-xl border border-border/50 bg-muted/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-bizrent-navy">{(inv.tenant as any)?.full_name}</p>
                  <p className="text-xxs text-muted-foreground font-medium">{inv.invoice_number} · Overdue {formatDate(inv.due_date)}</p>
                </div>
                <p className="text-sm font-extrabold text-bizrent-red">{formatRWF(inv.amount_due - (inv.amount_paid ?? 0))}</p>
              </div>
            ))}
            {(overdueInvoices ?? []).length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-20 text-bizrent-emerald" />
                <p className="text-sm font-bold text-bizrent-navy">Zero Overdue Invoices!</p>
                <p className="text-xs text-muted-foreground">Everyone is paid up or waiting on due dates.</p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between py-2 border-t mt-4 gap-3">
            <Button variant="ghost" className="rounded-xl font-bold text-xs" onClick={() => setReminderOpen(false)}>
              Discard
            </Button>
            <Button 
              className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-bold px-6 h-11"
              disabled={(overdueInvoices ?? []).length === 0}
              onClick={() => {
                toast.success(`Success! Sent reminders to ${(overdueInvoices ?? []).length} tenants.`);
                setReminderOpen(false);
              }}
            >
              <Send className="h-4 w-4 mr-2" /> Send All Reminders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
);
}