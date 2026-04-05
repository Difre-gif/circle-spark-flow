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
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function SuperAdminOrganizations() {
  const { data: pending, isLoading: loadingPending } = usePendingOrganisations();
  const { data: all, isLoading: loadingAll } = useAllOrganisations();
  const { impersonate } = useAuth();
  const approveMutation = useApproveOrganisation();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredAll = all?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    if (window.confirm("Are you sure you want to approve this organization and start their 30-day trial?")) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleImpersonate = (id: string) => {
    impersonate(id);
    navigate("/landlord");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock size={12}/> Pending</Badge>;
      case 'TRIAL':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Trial</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organization Management</h1>
        <p className="text-slate-500 font-medium tracking-tight">Review signups, monitor subscription health, and manage platform tenants.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-slate-100 p-1">
          <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Requests 
            {pending && pending.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">All Organizations</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg">Approval Queue</CardTitle>
              <CardDescription>New landlord registrations waiting for platform access.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPending ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : !pending || pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle2 size={32} /></div>
                  <div>
                    <p className="font-semibold text-slate-900">Queue is empty</p>
                    <p className="text-sm text-slate-500">All signup requests have been processed.</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Registered At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((org) => (
                      <TableRow key={org.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-900">{org.name}</TableCell>
                        <TableCell className="text-slate-600">{org.email || "N/A"}</TableCell>
                        <TableCell className="text-slate-500 text-xs">{formatDate(org.created_at)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            onClick={() => handleApprove(org.id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Approve Access"}
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

        <TabsContent value="all" className="mt-0">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search organizations..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loadingAll ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAll?.map((org) => (
                      <TableRow key={org.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-900">{org.name}</TableCell>
                        <TableCell>{getStatusBadge(org.subscription_status)}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{org.email || "N/A"}</TableCell>
                        <TableCell className="text-slate-500 text-xs font-medium">{formatDate(org.created_at)}</TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            title="Impersonate Landlord"
                            onClick={() => handleImpersonate(org.id)}
                          >
                            <ShieldCheck size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                            <ExternalLink size={16} />
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
      </Tabs>
    </div>
  );
}
