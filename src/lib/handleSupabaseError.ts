export function handleSupabaseError(error: any): string {
  const code = error?.code;
  const message = error?.message || '';
  const details = error?.details || '';

  switch (code) {
    case 'PGRST116':
      return 'No data found.';
    case '23505':
      return getUniqueConstraintMessage(details);
    case '42501':
      return 'You do not have permission to perform this action.';
    default:
      break;
  }

  // Custom BizRent error messages
  if (message.includes('DUPLICATE_TRANSACTION_ID') || (code === '23505' && details.includes('transaction_id'))) {
    return 'This transaction ID has already been submitted. If you believe this is an error, contact your landlord.';
  }
  if (message.includes('PENDING_PAYMENT_EXISTS')) {
    return 'A payment is already waiting for review on this invoice.';
  }
  if (message.includes('UNIT_OCCUPIED') || message.includes('already has an active')) {
    return 'This unit already has an active tenant.';
  }
  if (message.includes('UNIT_LIMIT_REACHED')) {
    return "You've reached your unit limit. Upgrade your plan to add more.";
  }
  if (message.includes('PROPERTY_LIMIT_REACHED')) {
    return "You've reached your property limit. Upgrade your plan to add more.";
  }
  if (message.includes('MANAGER_LIMIT_REACHED')) {
    return "You've reached your manager limit. Upgrade your plan to add more.";
  }
  if (message.includes('ACTIVE_TENANCIES_EXIST')) {
    return 'Cannot delete this property — it has active tenancies.';
  }
  if (message.includes('DUPLICATE_INVOICE') || (code === '23505' && details.includes('tenancy_id'))) {
    return 'An invoice already exists for this tenancy and billing period.';
  }
  if (message.includes('already belongs to an organisation')) {
    return 'This account already belongs to an organisation.';
  }

  return message || 'Something went wrong. Your data is safe — please try again.';
}

function getUniqueConstraintMessage(details: string): string {
  if (details.includes('transaction_id')) {
    return 'This transaction ID has already been submitted.';
  }
  if (details.includes('unit_number')) {
    return 'A unit with this number already exists in this property.';
  }
  if (details.includes('slug')) {
    return 'An organisation with this name already exists.';
  }
  if (details.includes('tenancy') || details.includes('unit_id')) {
    return 'This unit already has an active tenancy.';
  }
  return 'A record with these details already exists.';
}
