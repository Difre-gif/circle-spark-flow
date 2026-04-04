import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Helpers ───
export const formatRWF = (amount: number): string =>
  `RWF ${Number(amount).toLocaleString('en-US')}`;

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── Properties ───
export function useProperties() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['properties', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('org_id', orgId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useProperty(id: string | undefined) {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id!)
        .eq('org_id', orgId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!orgId,
  });
}

export function useCreateProperty() {
  const { orgId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; property_type: string; address_line1: string; city: string; district?: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .insert({ ...input, org_id: orgId!, property_type: input.property_type as any })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Units ───
export function useUnits(propertyId?: string) {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['units', orgId, propertyId],
    queryFn: async () => {
      let q = supabase
        .from('units')
        .select('*, properties!units_property_id_fkey(name)')
        .eq('org_id', orgId!)
        .eq('is_active', true)
        .order('unit_number');
      if (propertyId) q = q.eq('property_id', propertyId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useCreateUnit() {
  const { orgId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { property_id: string; unit_number: string; unit_type: string; monthly_rent: number; floor?: number }) => {
      const { data, error } = await supabase
        .from('units')
        .insert({ ...input, org_id: orgId!, unit_type: input.unit_type as any })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Unit created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Tenancies ───
export function useTenancies() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['tenancies', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenancies')
        .select('*, tenant:users!tenancies_tenant_user_id_fkey(full_name, email, phone), unit:units!tenancies_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name))')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useCreateTenancy() {
  const { orgId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { tenant_user_id: string; unit_id: string; start_date: string; agreed_rent: number; deposit_amount: number; end_date?: string }) => {
      const { data, error } = await supabase
        .from('tenancies')
        .insert({ ...input, org_id: orgId!, created_by: user!.id, status: 'ACTIVE' as any })
        .select()
        .single();
      if (error) {
        if (error.message?.includes('unique') || error.code === '23505') {
          throw new Error('This unit already has an active tenancy (UNIT_OCCUPIED).');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenancies'] });
      qc.invalidateQueries({ queryKey: ['units'] });
      toast.success('Tenancy created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Tenants (users with TENANT role in this org) ───
export function useTenants() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['tenants', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_organisation_roles')
        .select('user_id, role, created_at, is_active, accepted_at, user:users!user_organisation_roles_user_id_fkey(id, full_name, email, phone)')
        .eq('org_id', orgId!)
        .eq('role', 'TENANT')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

// ─── Invoices ───
export function useInvoices(filters?: { tenantUserId?: string; status?: string }) {
  const { orgId, user } = useAuth();
  const isTenant = !orgId || filters?.tenantUserId;
  return useQuery({
    queryKey: ['invoices', orgId, filters],
    queryFn: async () => {
      let q = supabase
        .from('invoices')
        .select('*, tenant:users!invoices_tenant_user_id_fkey(full_name), unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name))')
        .order('billing_period_start', { ascending: false });
      if (orgId) q = q.eq('org_id', orgId);
      if (filters?.tenantUserId) q = q.eq('tenant_user_id', filters.tenantUserId);
      if (filters?.status && filters.status !== 'ALL') q = q.eq('status', filters.status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId || !!filters?.tenantUserId,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, tenant:users!invoices_tenant_user_id_fkey(full_name, email, phone), unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name))')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ─── Payments ───
export function usePayments(filters?: { status?: string; tenantUserId?: string }) {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['payments', orgId, filters],
    queryFn: async () => {
      let q = supabase
        .from('payments')
        .select('*, invoice:invoices!payments_invoice_id_fkey(invoice_number, billing_period_start), tenant:users!payments_tenant_user_id_fkey(full_name), reviewer:users!payments_reviewed_by_fkey(full_name)')
        .order('submitted_at', { ascending: false });
      if (orgId) q = q.eq('org_id', orgId);
      if (filters?.status) q = q.eq('status', filters.status as any);
      if (filters?.tenantUserId) q = q.eq('tenant_user_id', filters.tenantUserId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId || !!filters?.tenantUserId,
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, invoice:invoices!payments_invoice_id_fkey(invoice_number, billing_period_start, amount_due), tenant:users!payments_tenant_user_id_fkey(full_name, phone), reviewer:users!payments_reviewed_by_fkey(full_name), proof:file_attachments!payments_proof_file_id_fkey(id, file_path, bucket, original_filename)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useApprovePayment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      // Get the payment first to know the invoice
      const { data: payment, error: fetchErr } = await supabase
        .from('payments')
        .select('invoice_id, amount')
        .eq('id', paymentId)
        .single();
      if (fetchErr) throw fetchErr;

      const { error } = await supabase
        .from('payments')
        .update({
          status: 'APPROVED' as any,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);
      if (error) throw error;

      // Update invoice
      const { data: invoice } = await supabase
        .from('invoices')
        .select('amount_paid, amount_due')
        .eq('id', payment.invoice_id)
        .single();
      if (invoice) {
        const newPaid = Number(invoice.amount_paid) + Number(payment.amount);
        const newStatus = newPaid >= Number(invoice.amount_due) ? 'PAID' : 'PARTIAL';
        await supabase
          .from('invoices')
          .update({ amount_paid: newPaid, balance: Number(invoice.amount_due) - newPaid, status: newStatus as any })
          .eq('id', payment.invoice_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment approved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectPayment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'REJECTED' as any,
          rejection_reason: reason,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment rejected');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSubmitPayment() {
  const { orgId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      invoice_id: string;
      amount: number;
      payment_method: string;
      transaction_id: string;
      proof_file?: File;
    }) => {
      let proof_file_id: string | null = null;

      // Upload proof screenshot if provided
      if (input.proof_file) {
        const filePath = `${orgId}/${input.invoice_id}/${Date.now()}-proof.${input.proof_file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, input.proof_file);
        if (uploadError) throw uploadError;

        const { data: attachment, error: attachError } = await supabase
          .from('file_attachments')
          .insert({
            org_id: orgId!,
            uploaded_by: user!.id,
            original_filename: input.proof_file.name,
            file_path: filePath,
            size_bytes: input.proof_file.size,
            mime_type: input.proof_file.type,
            bucket: 'payment-proofs',
          })
          .select('id')
          .single();
        if (attachError) throw attachError;
        proof_file_id = attachment.id;
      }

      const { error } = await supabase.from('payments').insert({
        org_id: orgId!,
        invoice_id: input.invoice_id,
        tenant_user_id: user!.id,
        amount: input.amount,
        payment_method: input.payment_method as any,
        transaction_id: input.transaction_id.toUpperCase(),
        proof_file_id,
        status: 'PENDING' as any,
      });
      if (error) {
        if (error.code === '23505') {
          throw new Error('This transaction ID has already been submitted. If you believe this is an error, contact your landlord.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment submitted for review');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Receipts ───
export function useReceipts(tenantUserId?: string) {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['receipts', orgId, tenantUserId],
    queryFn: async () => {
      let q = supabase
        .from('receipts')
        .select('*, invoice:invoices!receipts_invoice_id_fkey(invoice_number, billing_period_start, amount_due), tenant:users!receipts_tenant_user_id_fkey(full_name), unit:invoices!receipts_invoice_id_fkey(unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name)))')
        .order('generated_at', { ascending: false });
      if (orgId) q = q.eq('org_id', orgId);
      if (tenantUserId) q = q.eq('tenant_user_id', tenantUserId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId || !!tenantUserId,
  });
}

// ─── Notifications ───
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_user_id', user!.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ─── Audit Logs ───
export function useAuditLogs() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['audit-logs', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, actor:users!audit_logs_actor_user_id_fkey(full_name)')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

// ─── Organisation ───
export function useOrganisation() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['organisation', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', orgId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useUpdateOrganisation() {
  const { orgId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name?: string; email?: string; phone?: string }) => {
      const { error } = await supabase
        .from('organisations')
        .update(input)
        .eq('id', orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organisation'] });
      toast.success('Organisation updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Team Members ───
export function useTeamMembers() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['team', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_organisation_roles')
        .select('*, user:users!user_organisation_roles_user_id_fkey(full_name, email, phone)')
        .eq('org_id', orgId!)
        .eq('is_active', true)
        .neq('role', 'TENANT');
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

// ─── Subscription ───
export function useSubscription() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['subscription', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, tier_details:subscription_tiers!inner(*)')
        .eq('org_id', orgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

// ─── Dashboard Stats ───
export function useDashboardStats() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['dashboard-stats', orgId],
    queryFn: async () => {
      const [propertiesRes, unitsRes, paymentsRes, invoicesRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).eq('is_active', true),
        supabase.from('units').select('status').eq('org_id', orgId!).eq('is_active', true),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).eq('status', 'PENDING' as any),
        supabase.from('invoices').select('amount_due, amount_paid, status').eq('org_id', orgId!),
      ]);

      const units = unitsRes.data || [];
      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
      const vacantUnits = units.filter(u => u.status === 'VACANT').length;

      const invoices = invoicesRes.data || [];
      const totalDue = invoices.reduce((s, i) => s + Number(i.amount_due), 0);
      const totalPaid = invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
      const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
      const outstanding = totalDue - totalPaid;

      return {
        totalProperties: propertiesRes.count || 0,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        pendingPayments: paymentsRes.count || 0,
        collectionRate,
        outstanding,
      };
    },
    enabled: !!orgId,
  });
}

// ─── Occupancy Summary View ───
export function useOccupancySummary() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['occupancy-summary', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unit_occupancy_summary')
        .select('*')
        .eq('org_id', orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

// ─── Overdue Aging Report View ───
export function useOverdueAgingReport() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['overdue-aging', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('overdue_aging_report')
        .select('*')
        .eq('org_id', orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

// ─── Invoice Collection Summary View ───
export function useCollectionSummary() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['collection-summary', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_collection_summary')
        .select('*')
        .eq('org_id', orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}
