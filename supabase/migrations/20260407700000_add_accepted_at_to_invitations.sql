-- Add accepted_at to invitations table
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
