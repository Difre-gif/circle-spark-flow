export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_role: Database["public"]["Enums"]["user_role_enum"] | null
          actor_user_id: string | null
          created_at: string
          diff: Json | null
          id: number
          metadata: Json | null
          org_id: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_role?: Database["public"]["Enums"]["user_role_enum"] | null
          actor_user_id?: string | null
          created_at?: string
          diff?: Json | null
          id?: number
          metadata?: Json | null
          org_id?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_role?: Database["public"]["Enums"]["user_role_enum"] | null
          actor_user_id?: string | null
          created_at?: string
          diff?: Json | null
          id?: number
          metadata?: Json | null
          org_id?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_notification_jobs: {
        Row: {
          attempt_count: number
          created_at: string
          error_message: string | null
          id: number
          job_type: string
          org_id: string | null
          payload: Json
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: number
          job_type: string
          org_id?: string | null
          payload: Json
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: number
          job_type?: string
          org_id?: string | null
          payload?: Json
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_notification_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failed_notification_jobs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          bucket: string
          created_at: string
          file_path: string
          id: string
          mime_type: string
          org_id: string
          original_filename: string | null
          size_bytes: number
          uploaded_by: string
        }
        Insert: {
          bucket: string
          created_at?: string
          file_path: string
          id?: string
          mime_type: string
          org_id: string
          original_filename?: string | null
          size_bytes: number
          uploaded_by: string
        }
        Update: {
          bucket?: string
          created_at?: string
          file_path?: string
          id?: string
          mime_type?: string
          org_id?: string
          original_filename?: string | null
          size_bytes?: number
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          balance: number | null
          billing_period_end: string
          billing_period_start: string
          created_at: string
          due_date: string
          generated_by: string
          id: string
          invoice_number: string
          last_3day_reminder_sent_at: string | null
          last_7day_reminder_sent_at: string | null
          notes: string | null
          org_id: string
          status: Database["public"]["Enums"]["invoice_status_enum"]
          tax_reference: string | null
          tenancy_id: string
          tenant_user_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number
          balance?: number | null
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          due_date: string
          generated_by?: string
          id?: string
          invoice_number?: string
          last_3day_reminder_sent_at?: string | null
          last_7day_reminder_sent_at?: string | null
          notes?: string | null
          org_id: string
          status?: Database["public"]["Enums"]["invoice_status_enum"]
          tax_reference?: string | null
          tenancy_id: string
          tenant_user_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          balance?: number | null
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          due_date?: string
          generated_by?: string
          id?: string
          invoice_number?: string
          last_3day_reminder_sent_at?: string | null
          last_7day_reminder_sent_at?: string | null
          notes?: string | null
          org_id?: string
          status?: Database["public"]["Enums"]["invoice_status_enum"]
          tax_reference?: string | null
          tenancy_id?: string
          tenant_user_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_user_id_fkey"
            columns: ["tenant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          org_id: string
          read_at: string | null
          recipient_user_id: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          org_id: string
          read_at?: string | null
          recipient_user_id: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          org_id?: string
          read_at?: string | null
          recipient_user_id?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          country_code: string
          created_at: string
          currency_code: string
          email: string
          id: string
          is_active: boolean
          momo_merchant_number: string | null
          name: string
          phone: string | null
          slug: string
          subscription_status: Database["public"]["Enums"]["subscription_status_enum"]
          timezone: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          currency_code?: string
          email: string
          id?: string
          is_active?: boolean
          momo_merchant_number?: string | null
          name: string
          phone?: string | null
          slug: string
          subscription_status?: Database["public"]["Enums"]["subscription_status_enum"]
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          currency_code?: string
          email?: string
          id?: string
          is_active?: boolean
          momo_merchant_number?: string | null
          name?: string
          phone?: string | null
          slug?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status_enum"]
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          is_automated: boolean
          org_id: string
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          proof_file_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["payment_status_enum"]
          submitted_at: string
          tenant_user_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          is_automated?: boolean
          org_id: string
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          proof_file_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          submitted_at?: string
          tenant_user_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          is_automated?: boolean
          org_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          proof_file_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          submitted_at?: string
          tenant_user_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "overdue_aging_report"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_proof_file_id_fkey"
            columns: ["proof_file_id"]
            isOneToOne: false
            referencedRelation: "file_attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_user_id_fkey"
            columns: ["tenant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country_code: string
          created_at: string
          district: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          property_type: Database["public"]["Enums"]["property_type_enum"]
          total_units: number
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city?: string
          country_code?: string
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          property_type: Database["public"]["Enums"]["property_type_enum"]
          total_units?: number
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country_code?: string
          created_at?: string
          district?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          property_type?: Database["public"]["Enums"]["property_type_enum"]
          total_units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_manager_assignments: {
        Row: {
          assigned_by: string
          created_at: string
          id: string
          org_id: string
          property_id: string
          user_id: string
        }
        Insert: {
          assigned_by: string
          created_at?: string
          id?: string
          org_id: string
          property_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          id?: string
          org_id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_manager_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_manager_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_manager_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "overdue_aging_report"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_manager_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_manager_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "unit_occupancy_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_manager_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          download_count: number
          file_path: string
          file_size_bytes: number | null
          generated_at: string
          id: string
          invoice_id: string
          org_id: string
          payment_id: string
          receipt_number: string
          tenant_user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          file_path: string
          file_size_bytes?: number | null
          generated_at?: string
          id?: string
          invoice_id: string
          org_id: string
          payment_id: string
          receipt_number?: string
          tenant_user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number
          file_path?: string
          file_size_bytes?: number | null
          generated_at?: string
          id?: string
          invoice_id?: string
          org_id?: string
          payment_id?: string
          receipt_number?: string
          tenant_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "overdue_aging_report"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "receipts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_tenant_user_id_fkey"
            columns: ["tenant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string
          device_info: string | null
          expires_at: string
          id: string
          ip_address: unknown
          revoked_at: string | null
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          annual_price_rwf: number
          created_at: string
          has_api_access: boolean
          has_kinyarwanda: boolean
          has_whatsapp: boolean
          id: string
          max_managers: number
          max_properties: number
          max_units: number
          monthly_price_rwf: number
          tier: Database["public"]["Enums"]["subscription_tier_enum"]
          updated_at: string
        }
        Insert: {
          annual_price_rwf: number
          created_at?: string
          has_api_access?: boolean
          has_kinyarwanda?: boolean
          has_whatsapp?: boolean
          id?: string
          max_managers: number
          max_properties: number
          max_units: number
          monthly_price_rwf: number
          tier: Database["public"]["Enums"]["subscription_tier_enum"]
          updated_at?: string
        }
        Update: {
          annual_price_rwf?: number
          created_at?: string
          has_api_access?: boolean
          has_kinyarwanda?: boolean
          has_whatsapp?: boolean
          id?: string
          max_managers?: number
          max_properties?: number
          max_units?: number
          monthly_price_rwf?: number
          tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: Database["public"]["Enums"]["billing_cycle_enum"]
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          org_id: string
          status: Database["public"]["Enums"]["subscription_status_enum"]
          tier: Database["public"]["Enums"]["subscription_tier_enum"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle_enum"]
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          org_id: string
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle_enum"]
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenancies: {
        Row: {
          agreed_rent: number
          created_at: string
          created_by: string
          deposit_amount: number
          end_date: string | null
          id: string
          org_id: string
          start_date: string
          status: Database["public"]["Enums"]["tenancy_status_enum"]
          tenant_user_id: string
          terminated_at: string | null
          terminated_by: string | null
          termination_reason: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          agreed_rent: number
          created_at?: string
          created_by: string
          deposit_amount?: number
          end_date?: string | null
          id?: string
          org_id: string
          start_date: string
          status?: Database["public"]["Enums"]["tenancy_status_enum"]
          tenant_user_id: string
          terminated_at?: string | null
          terminated_by?: string | null
          termination_reason?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          agreed_rent?: number
          created_at?: string
          created_by?: string
          deposit_amount?: number
          end_date?: string | null
          id?: string
          org_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["tenancy_status_enum"]
          tenant_user_id?: string
          terminated_at?: string | null
          terminated_by?: string | null
          termination_reason?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenancies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_tenant_user_id_fkey"
            columns: ["tenant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_terminated_by_fkey"
            columns: ["terminated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          description: string | null
          floor: number | null
          id: string
          is_active: boolean
          monthly_rent: number
          org_id: string
          property_id: string
          status: Database["public"]["Enums"]["unit_status_enum"]
          unit_number: string
          unit_type: Database["public"]["Enums"]["unit_type_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          floor?: number | null
          id?: string
          is_active?: boolean
          monthly_rent: number
          org_id: string
          property_id: string
          status?: Database["public"]["Enums"]["unit_status_enum"]
          unit_number: string
          unit_type: Database["public"]["Enums"]["unit_type_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          floor?: number | null
          id?: string
          is_active?: boolean
          monthly_rent?: number
          org_id?: string
          property_id?: string
          status?: Database["public"]["Enums"]["unit_status_enum"]
          unit_number?: string
          unit_type?: Database["public"]["Enums"]["unit_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "overdue_aging_report"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "unit_occupancy_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      user_organisation_roles: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          org_id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          org_id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          org_id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organisation_roles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organisation_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organisation_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_email_verified: boolean
          last_login_at: string | null
          password_hash: string
          phone: string | null
          preferred_language: string
          two_fa_enabled: boolean
          two_fa_secret: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          is_email_verified?: boolean
          last_login_at?: string | null
          password_hash: string
          phone?: string | null
          preferred_language?: string
          two_fa_enabled?: boolean
          two_fa_secret?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          is_email_verified?: boolean
          last_login_at?: string | null
          password_hash?: string
          phone?: string | null
          preferred_language?: string
          two_fa_enabled?: boolean
          two_fa_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_dead_letters: {
        Row: {
          attempt_count: number
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          org_id: string
          payload: Json
          subscription_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          org_id: string
          payload: Json
          subscription_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          org_id?: string
          payload?: Json
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_dead_letters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_dead_letters_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          created_at: string
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          org_id: string
          secret: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          org_id: string
          secret: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          org_id?: string
          secret?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      invoice_collection_summary: {
        Row: {
          collection_rate_pct: number | null
          org_id: string | null
          overdue_count: number | null
          paid_count: number | null
          partial_count: number | null
          period: string | null
          total_amount_due: number | null
          total_amount_paid: number | null
          total_invoices: number | null
          total_outstanding: number | null
          unpaid_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      overdue_aging_report: {
        Row: {
          aging_bucket: string | null
          amount_due: number | null
          amount_overdue: number | null
          days_overdue: number | null
          due_date: string | null
          invoice_id: string | null
          invoice_number: string | null
          org_id: string | null
          property_id: string | null
          property_name: string | null
          tenant_name: string | null
          tenant_user_id: string | null
          unit_id: string | null
          unit_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_user_id_fkey"
            columns: ["tenant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_occupancy_summary: {
        Row: {
          maintenance_units: number | null
          monthly_revenue_lost_vacancy: number | null
          monthly_revenue_occupied: number | null
          occupancy_rate_pct: number | null
          occupied_units: number | null
          org_id: string | null
          property_id: string | null
          property_name: string | null
          property_type:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          total_units: number | null
          vacant_units: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      generate_receipt_number: { Args: never; Returns: string }
      get_current_org_id: { Args: never; Returns: string }
      get_current_user_id: { Args: never; Returns: string }
      set_org_context: {
        Args: { p_org_id: string; p_role: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      billing_cycle_enum: "MONTHLY" | "ANNUAL"
      invoice_status_enum: "DUE" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED"
      notification_type_enum:
        | "PAYMENT_SUBMITTED"
        | "PAYMENT_APPROVED"
        | "PAYMENT_REJECTED"
        | "INVOICE_DUE"
        | "INVOICE_OVERDUE"
        | "RECEIPT_AVAILABLE"
        | "SUBSCRIPTION_EXPIRING"
      payment_method_enum: "MOMO" | "BANK_TRANSFER" | "MPESA"
      payment_status_enum: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED"
      property_type_enum:
        | "APARTMENT"
        | "COMMERCIAL"
        | "OFFICE"
        | "KIOSK"
        | "MIXED_USE"
      subscription_status_enum: "TRIAL" | "ACTIVE" | "LAPSED" | "CANCELLED"
      subscription_tier_enum: "STARTER" | "GROWTH" | "PRO"
      tenancy_status_enum: "ACTIVE" | "TERMINATED" | "EXPIRED"
      unit_status_enum: "VACANT" | "OCCUPIED" | "MAINTENANCE"
      unit_type_enum:
        | "STUDIO"
        | "1BED"
        | "2BED"
        | "3BED"
        | "KIOSK"
        | "OFFICE"
        | "OTHER"
      user_role_enum:
        | "OWNER"
        | "MANAGER"
        | "ACCOUNTANT"
        | "TENANT"
        | "SUPER_ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_cycle_enum: ["MONTHLY", "ANNUAL"],
      invoice_status_enum: ["DUE", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"],
      notification_type_enum: [
        "PAYMENT_SUBMITTED",
        "PAYMENT_APPROVED",
        "PAYMENT_REJECTED",
        "INVOICE_DUE",
        "INVOICE_OVERDUE",
        "RECEIPT_AVAILABLE",
        "SUBSCRIPTION_EXPIRING",
      ],
      payment_method_enum: ["MOMO", "BANK_TRANSFER", "MPESA"],
      payment_status_enum: ["PENDING", "APPROVED", "REJECTED", "AUTO_APPROVED"],
      property_type_enum: [
        "APARTMENT",
        "COMMERCIAL",
        "OFFICE",
        "KIOSK",
        "MIXED_USE",
      ],
      subscription_status_enum: ["TRIAL", "ACTIVE", "LAPSED", "CANCELLED"],
      subscription_tier_enum: ["STARTER", "GROWTH", "PRO"],
      tenancy_status_enum: ["ACTIVE", "TERMINATED", "EXPIRED"],
      unit_status_enum: ["VACANT", "OCCUPIED", "MAINTENANCE"],
      unit_type_enum: [
        "STUDIO",
        "1BED",
        "2BED",
        "3BED",
        "KIOSK",
        "OFFICE",
        "OTHER",
      ],
      user_role_enum: [
        "OWNER",
        "MANAGER",
        "ACCOUNTANT",
        "TENANT",
        "SUPER_ADMIN",
      ],
    },
  },
} as const
