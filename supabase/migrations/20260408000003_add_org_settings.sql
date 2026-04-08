-- Migration: Add Organization Settings for Flexible Billing & Reminders
-- This gives landlords the "liberty" to define when invoices are due, 
-- how long the grace period is before a payment becomes "Overdue", 
-- and exactly when automated email reminders should be sent out.

ALTER TABLE public.organisations 
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{
  "billing": {
    "default_due_day": 1,
    "grace_period_days": 3
  },
  "reminders": {
    "days_before_due": [3],
    "days_after_due": [1, 5, 10]
  }
}'::jsonb;
