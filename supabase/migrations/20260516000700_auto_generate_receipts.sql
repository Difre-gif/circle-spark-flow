-- Automatically create one receipt record whenever a payment becomes approved.
-- This lives in the database so normal approvals, auto-approvals, and
-- super-admin approvals all behave consistently.

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_year text;
  v_seq bigint;
BEGIN
  v_year := to_char(now(), 'YYYY');

  -- Prevent two concurrent approvals from choosing the same next sequence.
  PERFORM pg_advisory_xact_lock(hashtext('receipt-number-' || v_year));

  SELECT coalesce(max(
    nullif(regexp_replace(receipt_number, '^BR-\d{4}-', ''), '')::bigint
  ), 0) + 1
  INTO v_seq
  FROM receipts
  WHERE receipt_number LIKE 'BR-' || v_year || '-%';

  RETURN 'BR-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_receipt_for_approved_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('APPROVED', 'AUTO_APPROVED')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO receipts (
      org_id,
      payment_id,
      invoice_id,
      tenant_user_id,
      file_path
    )
    VALUES (
      NEW.org_id,
      NEW.id,
      NEW.invoice_id,
      NEW.tenant_user_id,
      'receipts/' || NEW.org_id::text || '/' || NEW.id::text || '.pdf'
    )
    ON CONFLICT (payment_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_receipt_on_payment_approval ON public.payments;
CREATE TRIGGER trg_generate_receipt_on_payment_approval
AFTER INSERT OR UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.ensure_receipt_for_approved_payment();

-- Repair historical approved payments that were accepted before the trigger existed.
INSERT INTO receipts (
  org_id,
  payment_id,
  invoice_id,
  tenant_user_id,
  file_path
)
SELECT
  p.org_id,
  p.id,
  p.invoice_id,
  p.tenant_user_id,
  'receipts/' || p.org_id::text || '/' || p.id::text || '.pdf'
FROM payments p
WHERE p.status IN ('APPROVED', 'AUTO_APPROVED')
ON CONFLICT (payment_id) DO NOTHING;
