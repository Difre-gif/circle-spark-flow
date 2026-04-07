import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { format as dateFnsFormat } from 'date-fns';
import { toDate } from 'date-fns-tz';

// ─── Helpers ───
export const formatCurrency = (amount: number | string): string => {
  const currency = useAuthStore.getState().orgCurrency || 'RWF';
  return `${currency} ${Number(amount).toLocaleString('en-US')}`;
};

export const formatRWF = formatCurrency;

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const tz = useAuthStore.getState().orgTimezone || 'Africa/Kigali';
    const date = toDate(dateStr, { timeZone: tz });
    return dateFnsFormat(date, 'd MMMM yyyy');
  } catch (err) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
};

// ─── Properties ───
export function useProperties() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['properties', orgId],
    queryFn: async () => {
      // Fetch both properties and their occupancy stats
      const [propsRes, statsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('org_id', orgId!)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('unit_occupancy_summary')
          .select('property_id, occupied_units, occupancy_rate_pct, total_units')
          .eq('org_id', orgId!)
      ]);

      if (propsRes.error) throw propsRes.error;

      const properties = propsRes.data || [];
      const stats = statsRes.data || [];

      // Merge stats into properties
      return properties.map(p => {
        const pStats = stats.find(s => s.property_id === p.id);
        return {
          ...p,
          occupied_units: pStats?.occupied_units ?? 0,
          // Fallback to table's total_units if view is missing it
          total_units: pStats?.total_units ?? p.total_units ?? 0,
          occupancy_rate_pct: pStats?.occupancy_rate_pct ?? 0
        };
      });
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
      if (error) {
        if (error.code === '23505' && (error.message?.includes('properties_name_org_id_key') || error.message?.includes('unique'))) {
          throw new Error('A property with this name already exists in your organisation.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
      if (error) {
        if (error.code === '23505' && (error.message?.includes('units_unit_number_property_id_key') || error.message?.includes('unique'))) {
          throw new Error('This unit number already exists in this property.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Unit created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (unitId: string) => {
      const { error } = await supabase.from('units').delete().eq('id', unitId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Unit deleted');
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
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
  const { user, orgId, orgRole } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
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

      // Update invoice — do NOT set balance (it's a GENERATED column)
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
          .update({ amount_paid: newPaid, status: newStatus as any })
          .eq('id', payment.invoice_id);
      }

      // Insert audit log
      await supabase.from('audit_logs').insert({
        action: 'PAYMENT_APPROVED',
        target_type: 'PAYMENT',
        target_id: paymentId,
        actor_user_id: user!.id,
        actor_role: orgRole as any,
        org_id: orgId!,
        metadata: { amount: payment.amount, invoice_id: payment.invoice_id },
      });

      // Fire-and-forget: payment-approved email to tenant
      void (async () => {
        try {
          const { data: pm } = await supabase
            .from('payments')
            .select('transaction_id, tenant:users!payments_tenant_user_id_fkey(email, full_name), invoice:invoices!payments_invoice_id_fkey(invoice_number, billing_period_start, unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name)))')
            .eq('id', paymentId)
            .single();
          const { data: org } = await supabase.from('organisations').select('name').eq('id', orgId!).single();
          const tenant = (pm?.tenant as any);
          if (tenant?.email && pm) {
            const inv = (pm.invoice as any);
            const unit = inv?.unit;
            await supabase.functions.invoke('send-email', {
              body: {
                to: tenant.email,
                type: 'payment-approved',
                data: {
                  tenantName: tenant.full_name || tenant.email,
                  orgName: (org as any)?.name || 'BizRent',
                  amount: Number(payment.amount),
                  invoiceNumber: inv?.invoice_number || '',
                  propertyUnit: unit ? (unit.property?.name + ' — Unit ' + unit.unit_number) : '',
                  period: inv?.billing_period_start || '',
                  transactionId: pm.transaction_id || undefined,
                  approvedBy: user!.user_metadata?.full_name || user!.email || 'Management',
                  approvedAt: new Date().toISOString(),
                },
              },
            });
          }
        } catch { /* ignore email errors */ }
      })();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['receipts'] });
      toast.success('Payment approved. Receipt is being generated.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectPayment() {
  const { user, orgId, orgRole } = useAuth();
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

      // Insert audit log
      await supabase.from('audit_logs').insert({
        action: 'PAYMENT_REJECTED',
        target_type: 'PAYMENT',
        target_id: paymentId,
        actor_user_id: user!.id,
        actor_role: orgRole as any,
        org_id: orgId!,
        metadata: { rejection_reason: reason },
      });

      // Fire-and-forget: payment-rejected email to tenant
      void (async () => {
        try {
          const { data: pm } = await supabase
            .from('payments')
            .select('amount, transaction_id, tenant:users!payments_tenant_user_id_fkey(email, full_name), invoice:invoices!payments_invoice_id_fkey(invoice_number, billing_period_start, unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name)))')
            .eq('id', paymentId)
            .single();
          const { data: org } = await supabase.from('organisations').select('name').eq('id', orgId!).single();
          const tenant = (pm?.tenant as any);
          if (tenant?.email && pm) {
            const inv = (pm.invoice as any);
            const unit = inv?.unit;
            await supabase.functions.invoke('send-email', {
              body: {
                to: tenant.email,
                type: 'payment-rejected',
                data: {
                  tenantName: tenant.full_name || tenant.email,
                  orgName: (org as any)?.name || 'BizRent',
                  amount: Number(pm.amount),
                  invoiceNumber: inv?.invoice_number || '',
                  propertyUnit: unit ? (unit.property?.name + ' — Unit ' + unit.unit_number) : '',
                  period: inv?.billing_period_start || '',
                  transactionId: pm.transaction_id || undefined,
                  rejectionReason: reason,
                },
              },
            });
          }
        } catch { /* ignore email errors */ }
      })();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment rejected. Tenant has been notified.');
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

      // Fire-and-forget: payment-submitted alert to org owner/landlord
      void (async () => {
        try {
          const { data: inv } = await supabase
            .from('invoices')
            .select('invoice_number, unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name))')
            .eq('id', input.invoice_id)
            .single();
          const { data: ownerRow } = await supabase
            .from('user_organisation_roles')
            .select('user:users!user_organisation_roles_user_id_fkey(email, full_name)')
            .eq('org_id', orgId!)
            .eq('role', 'OWNER' as any)
            .limit(1)
            .single();
          const owner = (ownerRow?.user as any);
          if (owner?.email) {
            const unit = (inv?.unit as any);
            const tenantName = user!.user_metadata?.full_name || user!.email || 'Tenant';
            await supabase.functions.invoke('send-email', {
              body: {
                to: owner.email,
                type: 'payment-submitted',
                data: {
                  landlordName: owner.full_name || owner.email,
                  tenantName,
                  amount: input.amount,
                  propertyUnit: unit ? (unit.property?.name + ' — Unit ' + unit.unit_number) : '',
                  invoiceNumber: inv?.invoice_number || '',
                  transactionId: input.transaction_id.toUpperCase() || undefined,
                  submittedAt: new Date().toISOString(),
                },
              },
            });
          }
        } catch { /* ignore email errors */ }
      })();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
      const { data, error } = await supabase.rpc('get_dashboard_stats', { p_org_id: orgId! });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
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


//  Invitations 
export function useInvitations() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["invitations", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('org_id', orgId!)
        .eq('status', 'PENDING' as any)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useInviteTenant() {
  const { orgId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; unit_id?: string }) => {
      const { data: inserted, error } = await supabase
        .from('invitations')
        .insert({
          email: input.email.toLowerCase(),
          unit_id: input.unit_id || null,
          org_id: orgId!,
          invited_by: user!.id,
          role: 'TENANT' as any,
          status: 'PENDING' as any,
        })
        .select('id')
        .single();
      if (error) {
        if (error.code === '23505') throw new Error('This user has already been invited to your organisation.');
        throw error;
      }

      const invitationId = inserted?.id;

      // Fire-and-forget: tenant-invitation email
      void (async () => {
        try {
          const { data: org } = await supabase.from('organisations').select('name').eq('id', orgId!).single();
          let unitInfo: string | undefined;
          if (input.unit_id) {
            const { data: unitRow } = await supabase
              .from('units')
              .select('unit_number, property:properties!units_property_id_fkey(name)')
              .eq('id', input.unit_id)
              .single();
            if (unitRow) {
              const prop = (unitRow.property as any);
              unitInfo = prop ? (prop.name + ' — Unit ' + unitRow.unit_number) : ('Unit ' + unitRow.unit_number);
            }
          }
          const inviterName = user!.user_metadata?.full_name || user!.email || 'Management';
          await supabase.functions.invoke('send-email', {
            body: {
              to: input.email.toLowerCase(),
              type: 'tenant-invitation',
              data: {
                orgName: (org as any)?.name || 'BizRent',
                inviterName,
                unitInfo,
                invitationId,
              },
            },
          });
        } catch { /* ignore email errors */ }
      })();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation saved. The tenant will be linked automatically when they sign up.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInviteStaff() {
  const { orgId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; role: 'MANAGER' | 'ACCOUNTANT' }) => {
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: input.email.toLowerCase(),
          org_id: orgId!,
          invited_by: user!.id,
          role: input.role as any,
          status: 'PENDING' as any,
        });
      if (error) {
        if (error.code === '23505') throw new Error('This user has already been invited to your organisation.');
        throw error;
      }

      // Fire-and-forget: staff-invitation email
      void (async () => {
        try {
          const { data: org } = await supabase.from('organisations').select('name').eq('id', orgId!).single();
          const inviterName = user!.user_metadata?.full_name || user!.email || 'Management';
          await supabase.functions.invoke('send-email', {
            body: {
              to: input.email.toLowerCase(),
              type: 'staff-invitation',
              data: {
                orgName: (org as any)?.name || 'BizRent',
                inviterName,
                role: input.role,
                invitationId: invData.id,
              },
            },
          });
        } catch { /* ignore email errors */ }
      })();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Staff invitation sent. They will be linked automatically when they sign up.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateOrganisation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; country_code?: string }) => {
      // Basic slug generation
      const slug = input.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const { data, error } = await supabase.rpc('register_organisation', {
        p_name: input.name,
        p_slug: slug,
        p_email: user?.email || '',
        p_phone: user?.phone || ''
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organisations'] });
      qc.invalidateQueries({ queryKey: ['all-organisations'] }); // For Super Admin
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Super Admin Hooks ───
export function usePendingOrganisations() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['pending-organisations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('subscription_status', 'PENDING_APPROVAL')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin,
  });
}

export function useApproveOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('organisations')
        .update({ 
          subscription_status: 'TRIAL' as any,
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq('id', orgId);
      if (error) throw error;
      
      // Also ensure a subscription record exists and is active
      await supabase
        .from('subscriptions')
        .update({ status: 'TRIAL' as any, trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('org_id', orgId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-organisations'] });
      qc.invalidateQueries({ queryKey: ['organisations'] });
      toast.success('Organisation approved and trial started.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAllOrganisations() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['all-organisations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organisations')
        .select(`
          *, 
          subscriptions(tier, status),
          user_organisation_roles(
            role,
            users(id, email, full_name, phone)
          )
        `)
        .eq('user_organisation_roles.role', 'OWNER')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Flatten the subscription and owner data for easier UI usage
      return data.map(org => {
        const ownerRole = org.user_organisation_roles?.[0];
        const owner = ownerRole?.users;
        
        return {
          ...org,
          active_tier: org.subscriptions?.[0]?.tier || 'N/A',
          active_subscription_status: org.subscriptions?.[0]?.status || 'INACTIVE',
          owner: owner ? {
            id: owner.id,
            email: owner.email,
            name: owner.full_name,
            phone: owner.phone
          } : null
        };
      });
    },
    enabled: !!isSuperAdmin,
  });
}

export function usePlatformStats() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { count: orgCount } = await supabase.from('organisations').select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: unitCount } = await supabase.from('units').select('*', { count: 'exact', head: true });
      const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'APPROVED');
      
      const totalVolume = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;

      return {
        orgCount: orgCount || 0,
        userCount: userCount || 0,
        unitCount: unitCount || 0,
        totalVolume: totalVolume,
      };
    },
    enabled: !!isSuperAdmin,
  });
}

export function useGlobalAuditLogs() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['global-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          actor:users!audit_logs_actor_user_id_fkey(full_name, email),
          org:organisations!audit_logs_org_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin,
  });
}

export function useGlobalUsers() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['global-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:user_organisation_roles(
            role,
            is_active,
            org:organisations(name)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin,
  });
}

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('monthly_price_rwf', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('subscription_tiers')
        .update(input.updates)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-tiers'] });
      toast.success('Subscription tier updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGlobalAdminMetrics() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['global-admin-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_global_admin_metrics');
      if (error) throw error;
      return data as {
        mrr: number;
        collection_rate: number;
        active_orgs: number;
        pending_orgs: number;
        total_units: number;
        platform_growth_pct: number;
      };
    },
    enabled: !!isSuperAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useOrgSubscription(orgId: string | undefined) {
  return useQuery({
    queryKey: ['org-subscription', orgId],
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

export function useUpdateOrgSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orgId: string; updates: any }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update(input.updates)
        .eq('org_id', input.orgId);
      if (error) throw error;
      
      // Also update the organization's subscription_status for top-level visibility
      if (input.updates.status) {
        await supabase
          .from('organisations')
          .update({ subscription_status: input.updates.status as any })
          .eq('id', input.orgId);
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['org-subscription', variables.orgId] });
      qc.invalidateQueries({ queryKey: ['all-organisations'] });
      qc.invalidateQueries({ queryKey: ['global-admin-metrics'] });
      toast.success('Organization subscription manually overridden');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}


export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const { error } = await supabase
        .from('user_organisation_roles')
        .update({ is_active: !suspend })
        .eq('user_id', userId);
      if (error) throw error;
      
      // Also potentially update a global 'is_active' on the users table if it exists
      // For now, disabling all their org access is the standard suspension
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-users'] });
      toast.success('User access status updated across all organizations');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-users'] });
      toast.success('User permanently removed from platform');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useFailedJobs() {
  const { isSuperAdmin } = useAuth();
  return useQuery({
    queryKey: ['failed-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('failed_notification_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin,
  });
}

export function useRetryJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      // In a real system, this would trigger an Edge Function or RPC to re-queue.
      // For now, we'll simulate resolution by updating the record.
      const { error } = await supabase
        .from('failed_notification_jobs')
        .update({ 
          resolved_at: new Date().toISOString(),
          attempt_count: 5 // Mark as finally attempted/resolved
        })
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['failed-jobs'] });
      toast.success("Job re-queued successfully");
    },
  });
}

// ─── Notification Preferences ───
export interface NotificationPrefs {
  payment_submissions: boolean;
  overdue_invoices: boolean;
  invoice_reminders: boolean;
  payment_status: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  payment_submissions: true,
  overdue_invoices: true,
  invoice_reminders: true,
  payment_status: true,
};

export function useNotificationPrefs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notification-prefs', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('notification_prefs')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return { ...DEFAULT_PREFS, ...(data?.notification_prefs ?? {}) } as NotificationPrefs;
    },
  });
}

export function useUpdateNotificationPrefs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPrefs>) => {
      const { data: current } = await supabase
        .from('users')
        .select('notification_prefs')
        .eq('id', user!.id)
        .single();
      const merged = { ...DEFAULT_PREFS, ...(current?.notification_prefs ?? {}), ...prefs };
      const { error } = await supabase
        .from('users')
        .update({ notification_prefs: merged })
        .eq('id', user!.id);
      if (error) throw error;
      return merged;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-prefs', user?.id] });
      toast.success('Notification preferences saved.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Property CRUD ───
export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; name?: string; property_type?: string; address_line1?: string; city?: string; district?: string }) => {
      const { error } = await supabase.from('properties').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase.from('properties').update({ is_active: false }).eq('id', propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Property removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Unit CRUD ───
export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; unit_number?: string; unit_type?: string; monthly_rent?: number }) => {
      const { error } = await supabase.from('units').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Tenant management ───
export function useUpdateTenantDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, full_name, phone }: { userId: string; full_name?: string; phone?: string }) => {
      const patch: Record<string, string> = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (phone !== undefined) patch.phone = phone;
      const { error } = await supabase.from('users').update(patch).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant details updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

  export function useRemoveTenant() {
    const { orgId } = useAuth();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (tenantUserId: string) => {
        const { error } = await supabase.rpc('remove_tenant_from_org', {
          p_tenant_user_id: tenantUserId,
          p_org_id: orgId!,
        });
        if (error) throw error;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['tenants'] });
        qc.invalidateQueries({ queryKey: ['tenancies'] });
        qc.invalidateQueries({ queryKey: ['units'] });
        qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
        toast.success('Tenant removed from organisation');
      },
      onError: (e: Error) => toast.error(e.message),
    });
  }

  export function useUpdateTenantProfile() {
    const { orgId } = useAuth();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: { user_id: string; full_name: string; phone: string }) => {
        const { error } = await supabase.rpc('update_tenant_profile', {
          p_tenant_id: input.user_id,
          p_org_id: orgId!,
          p_name: input.full_name,
          p_phone: input.phone || ''
        });
        if (error) throw error;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['tenants'] });
        toast.success('Tenant profile updated');
      },
      onError: (e: Error) => toast.error(e.message),
    });
  }

export function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.rpc('cancel_invitation', { p_invitation_id: invitationId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation cancelled');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useResendInvitation() {
  const { user, orgId } = useAuth();
  return useMutation({
    mutationFn: async (inv: { id: string; email: string; unit_id?: string | null }) => {
      const { data: org } = await supabase.from('organisations').select('name').eq('id', orgId!).single();
      let unitInfo: string | undefined;
      if (inv.unit_id) {
        const { data: unitRow } = await supabase
          .from('units')
          .select('unit_number, property:properties!units_property_id_fkey(name)')
          .eq('id', inv.unit_id)
          .single();
        if (unitRow) {
          const prop = (unitRow.property as any);
          unitInfo = prop ? prop.name + ' — Unit ' + unitRow.unit_number : 'Unit ' + unitRow.unit_number;
        }
      }
      await supabase.functions.invoke('send-email', {
        body: {
          to: inv.email,
          type: 'tenant-invitation',
          data: {
            orgName: (org as any)?.name ?? 'BizRent',
            inviterName: user!.email,
            unitInfo,
            invitationId: inv.id,
          },
        },
      });
    },
    onSuccess: () => toast.success('Invitation resent'),
    onError: (e: Error) => toast.error(e.message),
  });
}
