import { useState } from "react";
import { useGlobalUsers, formatDate } from "@/hooks/useSupabaseData";
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
  UserPlus, 
  Loader2,
  ShieldAlert,
  User,
  MoreVertical,
  Mail,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuperAdminUsers() {
  const { data: users, isLoading } = useGlobalUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
        <p className="text-slate-500 font-medium tracking-tight italic">Platform-wide registry of landlords, tenants, and system managers.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Identity</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Roles & Organizations</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 flex items-center gap-2">
                          {u.full_name}
                          {u.email === 'fredricknjorogekariuki@gmail.com' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] uppercase font-bold">Root Admin</Badge>
                          )}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{u.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[13px] text-slate-600">
                          <Mail size={12} className="text-slate-400" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1 text-[13px] text-slate-600">
                            <Phone size={12} className="text-slate-400" /> {u.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r, idx) => (
                          <div key={idx} className="flex flex-col p-1.5 rounded-lg border border-slate-100 bg-white shadow-sm min-w-[120px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.org?.name || "Global"}</span>
                            <Badge variant="outline" className={`${getRoleBadge(r.role)} border-none text-[10px] px-1 h-5 w-fit`}>
                              {r.role}
                            </Badge>
                          </div>
                        ))}
                        {(!u.roles || u.roles.length === 0) && (
                          <span className="text-xs text-slate-400 italic">No associated roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">
                      {formatDate(u.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
