import { useState } from "react";
import { 
  useGlobalUsers, 
  useSuspendUser, 
  useDeleteUser, 
  formatDate 
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  Loader2,
  ShieldAlert,
  User,
  MoreVertical,
  Mail,
  Phone,
  UserX,
  UserCheck,
  Trash2,
  Key,
  ShieldSlash,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function SuperAdminUsers() {
  const { data: users, isLoading } = useGlobalUsers();
  const { impersonateUser } = useAuth();
  const navigate = useNavigate();
  const suspendMutation = useSuspendUser();
  const deleteMutation = useDeleteUser();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuspend = async (userId: string, currentlyActive: boolean) => {
    const action = currentlyActive ? "suspend" : "reactivate";
    if (window.confirm(`Are you sure you want to ${action} this user's access across all organizations?`)) {
      await suspendMutation.mutateAsync({ userId, suspend: currentlyActive });
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (window.confirm(`CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE user "${name}"? This will remove all their associations and data records. This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(userId);
    }
  };

  const handleResetPassword = (email: string) => {
    toast.info(`Password reset trigger for ${email} would be sent via Supabase Auth.`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TENANT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Fingerprint className="text-indigo-600" size={32} />
          Identity Management
        </h1>
        <p className="text-slate-500 font-medium tracking-tight italic">Platform-wide registry of landlords, tenants, and system managers.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by name, email or global identity ID..." 
            className="pl-12 h-12 rounded-2xl border-slate-100 shadow-sm focus-visible:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-8 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Global Identity</TableHead>
                  <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Contact Channels</TableHead>
                  <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Organization Roles</TableHead>
                  <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Joined</TableHead>
                  <TableHead className="text-right px-8 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 py-6">Identity Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((u) => {
                  const isRoot = u.email === 'fredricknjorogekariuki@gmail.com';
                  const isAllActive = u.roles?.every(r => r.is_active) ?? true;
                  
                  return (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors group border-slate-50">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-[18px] flex items-center justify-center font-black text-xs shadow-inner transition-transform group-hover:scale-105 ${isRoot ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                              {u.full_name}
                              {isRoot && (
                                <Badge variant="outline" className="bg-amber-500 text-white border-none text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md tracking-tighter">Root Admin</Badge>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono tracking-tighter">{u.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                            <Mail size={12} className="text-slate-400" /> {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                              <Phone size={12} className="text-slate-400" /> {u.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {u.roles?.map((r, idx) => (
                            <div key={idx} className={`flex flex-col p-2 rounded-xl border transition-all ${r.is_active ? 'border-slate-100 bg-white' : 'border-red-100 bg-red-50/30 opacity-70'} min-w-[140px] shadow-sm`}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] truncate max-w-[80px]">{r.org?.name || "Global"}</span>
                                {!r.is_active && <ShieldSlash size={10} className="text-red-500" />}
                              </div>
                              <Badge variant="outline" className={`${getRoleBadge(r.role)} border-none text-[9px] font-black uppercase tracking-widest px-2 h-5 w-fit rounded-lg`}>
                                {r.role}
                              </Badge>
                            </div>
                          ))}
                          {(!u.roles || u.roles.length === 0) && (
                            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Abandoned Identity</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all active:scale-90">
                              <MoreVertical size={20} className="text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-2xl border-slate-100">
                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Mission Control</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-indigo-50 text-indigo-600 flex items-center gap-3"
                              disabled={isRoot}
                              onClick={() => {
                                impersonateUser({
                                  id: u.id,
                                  name: u.full_name,
                                  email: u.email,
                                  phone: u.phone || '',
                                  role: u.roles?.[0]?.role === 'TENANT' ? 'tenant' : 'landlord',
                                  organisationId: u.roles?.[0]?.org_id
                                } as any);
                                navigate(u.roles?.[0]?.role === 'TENANT' ? "/tenant" : "/landlord");
                              }}
                            >
                              <ShieldAlert size={16} /> Login As User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-slate-100" />
                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Account Security</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-slate-50 flex items-center gap-3"
                              onClick={() => handleResetPassword(u.email)}
                            >
                              <Key size={16} className="text-slate-500" /> Reset Security
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-slate-50 flex items-center gap-3 ${isAllActive ? 'text-amber-600' : 'text-emerald-600'}`}
                              onClick={() => handleSuspend(u.id, isAllActive)}
                              disabled={isRoot || suspendMutation.isPending}
                            >
                              {isAllActive ? <UserX size={16} /> : <UserCheck size={16} />}
                              {isAllActive ? "Suspend Identity" : "Restore Identity"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-slate-100" />
                            <DropdownMenuItem 
                              className="rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-red-50 text-red-600 flex items-center gap-3"
                              onClick={() => handleDelete(u.id, u.full_name)}
                              disabled={isRoot || deleteMutation.isPending}
                            >
                              <Trash2 size={16} /> Permanently Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
