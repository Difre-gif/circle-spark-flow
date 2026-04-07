-- Add notification preferences column to users table
-- Stores per-user email/notification opt-in settings as JSONB
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{
    "payment_submissions": true,
    "overdue_invoices": true,
    "invoice_reminders": true,
    "payment_status": true
  }'::jsonb;
