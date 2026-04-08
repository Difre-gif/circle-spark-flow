import { useState } from "react";
import { 
  usePendingOrganisations, 
  useAllOrganisations, 
  useApproveOrganisation,
  formatDate 
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  Filter,
  Loader2,
  Clock,
  ShieldCheck,
  Download,
  Settings2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { SubscriptionOverrideModal } from "@/components/super-admin/SubscriptionOverrideModal";

export default function SuperAdminOrganizations() {
  const { data: pending, isLoading: loadingPending } = usePendingOrganisations();
  const { data: all, isLoading: loadingAll } = useAllOrganisations();
  const { impersonate, impersonateUser } = useAuth();
  const approveMutation = useApproveOrganisation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const navigate = useNavigate();

  // Override Modal State
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(null);

  const filteredAll = all?.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         org.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || org.subscription_status === statusFilter;
    const matchesTier = tierFilter === "ALL" || org.active_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleApprove = async (id: string) => {
    if (window.confirm("Are you sure you want to approve this organization and start their 30-day trial?")) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleImpersonate = (org: any) => {
    if (org.owner) {
      impersonateUser({
        ...org.owner,
        role: 'landlord',
        organisationId: org.id
      });
    } else {
      impersonate(org.id);
    }
    navigate("/landlord");
  };

  const handleOpenOverride = (id: string, name: string) => {
    setSelectedOrg({ id, name });
    setOverrideOpen(true);
  };

  const exportToCSV = () => {
    if (!filteredAll || filteredAll.length === 0) return;
    
    const headers = ["Name", "Email", "Status", "Tier", "Joined At"];
    const rows = filteredAll.map(org => [
      org.name,
      org.email || "N/A",
      org.subscription_status,
      org.active_tier,
      new Date(org.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bizrent_organizations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export starting...");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TRIAL':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Trial</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'STARTER':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] tracking-widest border-none">Starter</Badge>;
      case 'GROWTH':
        return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold uppercase text-[9px] tracking-widest">Growth</Badge>;
      case 'PRO':
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 font-bold uppercase text-[9px] tracking-widest">Pro</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-400 border-slate-100 italic">{tier}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} />
            Organization Registry
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Review signups, monitor subscription health, and manage platform tenants.</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="h-11 rounded-xl font-bold gap-2 border-slate-200 shadow-sm active:scale-95 transition-all text-xs uppercase tracking-widest px-6">
          <Download size={18} />
          Export to CSV
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-slate-100 p-1 rounded-2xl">
          <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest h-10">
            Activation Requests 
            {pending && pending.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest h-10">Total Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <Card className="border-none shadow-md overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-white border-b border-slate-50 p-8 pb-6">
              <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <div className="h-4 w-1 bg-amber-500 rounded-full" />
                Requests Queue
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium italic">Pending co-founder authorization for platform launch.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPending ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : !pending || pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl animate-bounce"><CheckCircle2 size={40} /></div>
                  <div>
                    <p className="font-bold text-slate-900 uppercase tracking-tight">Inbox Zero</p>
                    <p className="text-sm text-slate-400 font-medium">No organizations are waiting for review.</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">Organization Identity</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Contact Email</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Registration</TableHead>
                      <TableHead className="text-right px-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">Governance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((org) => (
                      <TableRow key={org.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">{org.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 font-medium">{org.email || "N/A"}</TableCell>
                        <TableCell className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">{formatDate(org.created_at)}</TableCell>
                        <TableCell className="text-right px-8">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-9 px-6 shadow-lg shadow-emerald-600/10 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                            onClick={() => handleApprove(org.id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Approve Launch"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, email or slug..." 
                className="pl-12 h-12 rounded-2xl border-slate-100 shadow-sm focus-visible:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-12 rounded-2xl border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl p-2 border-slate-100">
                  <SelectItem value="ALL" className="rounded-lg font-bold">All Statuses</SelectItem>
                  <SelectItem value="TRIAL" className="rounded-lg font-bold">In Trial</SelectItem>
                  <SelectItem value="ACTIVE" className="rounded-lg font-bold">Active</SelectItem>
                  <SelectItem value="INACTIVE" className="rounded-lg font-bold">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[160px] h-12 rounded-2xl border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-600">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="rounded-xl p-2 border-slate-100">
                  <SelectItem value="ALL" className="rounded-lg font-bold">All Tiers</SelectItem>
                  <SelectItem value="STARTER" className="rounded-lg font-bold">Starter</SelectItem>
                  <SelectItem value="GROWTH" className="rounded-lg font-bold">Growth</SelectItem>
                  <SelectItem value="PRO" className="rounded-lg font-bold">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-none shadow-md overflow-hidden rounded-[2.5rem]">
            <CardContent className="p-0">
              {loadingAll ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-900">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-8 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Organization Profile</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Status</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Tier</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Contact Email</TableHead>
                      <TableHead className="text-right px-8 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">God-Mode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAll?.map((org) => (
                      <TableRow key={org.id} className="hover:bg-slate-50 transition-colors border-slate-50 group">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-[14px] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shadow-inner group-hover:scale-110 transition-transform">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 tracking-tight">{org.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{org.slug}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(org.subscription_status)}</TableCell>
                        <TableCell>{getTierBadge(org.active_tier)}</TableCell>
                        <TableCell className="text-slate-500 font-semibold text-sm">{org.email || "N/A"}</TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 active:scale-90 transition-all shadow-sm group-hover:shadow-md"
                              title="Override Subscription"
                              onClick={() => handleOpenOverride(org.id, org.name)}
                            >
                              <Settings2 size={18} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-90 transition-all shadow-sm group-hover:shadow-md"
                              title="Impersonate (Step-In)"
                              onClick={() => handleImpersonate(org.id)}
                            >
                              <ShieldCheck size={18} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 active:scale-90 transition-all shadow-sm group-hover:shadow-md"
                              title="External Profile View"
                            >
                              <ExternalLink size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedOrg && (
        <SubscriptionOverrideModal 
          isOpen={overrideOpen}
          onOpenChange={setOverrideOpen}
          orgId={selectedOrg.id}
          orgName={selectedOrg.name}
        />
      )}
    </div>
  );
}
