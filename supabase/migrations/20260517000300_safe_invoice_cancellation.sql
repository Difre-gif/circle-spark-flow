-- Issued invoices should be voided, not deleted.
-- Only unpaid invoices can be cancelled by landlords.

CREATE OR REPLACE FUNCTION public.cancel_invoice(
  p_invoice_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice RECORD;
  v_actor_role text;
BEGIN
  IF length(trim(COALESCE(p_reason, ''))) < 5 THEN
    RAISE EXCEPTION 'Cancellation reason is required';
  END IF;

  SELECT * INTO v_invoice
  FROM invoices
  WHERE id = p_invoice_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  SELECT role::text INTO v_actor_role
  FROM user_organisation_roles
  WHERE user_id = auth.uid()
    AND org_id = v_invoice.org_id
    AND is_active = true
  LIMIT 1;

  IF v_actor_role NOT IN ('OWNER', 'MANAGER', 'ACCOUNTANT') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  IF v_invoice.status IN ('PAID', 'PARTIAL') OR v_invoice.amount_paid > 0 THEN
    RAISE EXCEPTION 'Paid or partially paid invoices cannot be cancelled';
  END IF;

  IF v_invoice.status = 'CANCELLED' THEN
    RETURN;
  END IF;

  UPDATE invoices
  SET status = 'CANCELLED',
      notes = concat_ws(E'\n', notes, 'Cancelled: ' || trim(p_reason)),
      updated_at = now()
  WHERE id = p_invoice_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (
    v_invoice.org_id,
    auth.uid(),
    v_actor_role,
    'INVOICE_CANCELLED',
    'INVOICE',
    p_invoice_id,
    jsonb_build_object(
      'before', jsonb_build_object('status', v_invoice.status),
      'after', jsonb_build_object('status', 'CANCELLED'),
      'reason', trim(p_reason)
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_invoice(uuid, text) TO authenticated;
