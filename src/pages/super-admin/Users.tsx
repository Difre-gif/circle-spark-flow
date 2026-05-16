import { useTranslation } from 'react-i18next';
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
  ShieldOff,
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
  const { t } = useTranslation();
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
      default: return 'bg-muted text-foreground/80 border-border';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Fingerprint className="text-indigo-600" size={32} />
          {t('legacy.identityManagement')}
        </h1>
        <p className="text-muted-foreground font-medium tracking-tight italic">{t('legacy.platformWideRegistryOfLandlordsTenantsAndSystemManagers')}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or global identity ID..." 
            className="pl-12 h-12 rounded-2xl border-border shadow-sm focus-visible:ring-indigo-500/20"
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
                  <TableHead className="px-8 font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.globalIdentity')}</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.contactChannels')}</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.organizationRoles')}</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.joined')}</TableHead>
                  <TableHead className="text-right px-8 font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.identityControl')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((u) => {
                  const isRoot = u.email === 'fredricknjorogekariuki@gmail.com';
                  const isAllActive = u.roles?.every(r => r.is_active) ?? true;
                  
                  return (
                    <TableRow key={u.id} className="hover:bg-bizrent-light transition-colors group border-slate-50">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-[18px] flex items-center justify-center font-black text-xs shadow-inner transition-transform group-hover:scale-105 ${isRoot ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground tracking-tight flex items-center gap-2">
                              {u.full_name}
                              {isRoot && (
                                <Badge variant="outline" className="bg-amber-500 text-white border-none text-xxxs uppercase font-black px-1.5 py-0.5 rounded-md tracking-tighter">{t('legacy.rootAdmin')}</Badge>
                              )}
                            </span>
                            <span className="text-xxs text-muted-foreground font-bold font-mono tracking-tighter">{u.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <Mail size={12} className="text-muted-foreground" /> {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                              <Phone size={12} className="text-muted-foreground" /> {u.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {u.roles?.map((r, idx) => (
                            <div key={idx} className={`flex flex-col p-2 rounded-xl border transition-all ${r.is_active ? 'border-border bg-white' : 'border-red-100 bg-red-50/30 opacity-70'} min-w-[140px] shadow-sm`}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-xxxs font-black text-muted-foreground uppercase tracking-[0.1em] truncate max-w-[80px]">{r.org?.name || "Global"}</span>
                                {!r.is_active && <ShieldOff size={10} className="text-red-500" />}
                              </div>
                              <Badge variant="outline" className={`${getRoleBadge(r.role)} border-none text-xxxs font-black uppercase tracking-widest px-2 h-5 w-fit rounded-lg`}>
                                {r.role}
                              </Badge>
                            </div>
                          ))}
                          {(!u.roles || u.roles.length === 0) && (
                            <span className="text-xxs text-slate-300 font-black uppercase tracking-widest italic">{t('legacy.abandonedIdentity')}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-bold uppercase tracking-tight">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted transition-all active:scale-90">
                              <MoreVertical size={20} className="text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 shadow-2xl border-border">
                            <DropdownMenuLabel className="text-xxs font-black text-muted-foreground uppercase tracking-widest px-3 py-2">{t('legacy.missionControl')}</DropdownMenuLabel>
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
                              <ShieldAlert size={16} /> {t('legacy.loginAsUser')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-muted" />
                            <DropdownMenuLabel className="text-xxs font-black text-muted-foreground uppercase tracking-widest px-3 py-2">{t('legacy.accountSecurity')}</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-muted/40 flex items-center gap-3"
                              onClick={() => handleResetPassword(u.email)}
                            >
                              <Key size={16} className="text-muted-foreground" /> {t('legacy.resetSecurity')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-muted/40 flex items-center gap-3 ${isAllActive ? 'text-amber-600' : 'text-emerald-600'}`}
                              onClick={() => handleSuspend(u.id, isAllActive)}
                              disabled={isRoot || suspendMutation.isPending}
                            >
                              {isAllActive ? <UserX size={16} /> : <UserCheck size={16} />}
                              {isAllActive ? "Suspend Identity" : "Restore Identity"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-muted" />
                            <DropdownMenuItem 
                              className="rounded-xl font-bold text-sm py-2.5 px-3 cursor-pointer focus:bg-red-50 text-red-600 flex items-center gap-3"
                              onClick={() => handleDelete(u.id, u.full_name)}
                              disabled={isRoot || deleteMutation.isPending}
                            >
                              <Trash2 size={16} /> {t('legacy.permanentlyDelete')}
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
