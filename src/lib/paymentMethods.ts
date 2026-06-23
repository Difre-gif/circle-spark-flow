export type PaymentMethodCode = 'MOMO' | 'MPESA' | 'BANK_TRANSFER';

type PaymentContextInput = {
  countryCode?: string | null;
  currencyCode?: string | null;
};

export const getMobileMoneyContext = ({ countryCode, currencyCode }: PaymentContextInput) => {
  const country = countryCode?.toUpperCase();
  const currency = currencyCode?.toUpperCase();
  const isKenya = country === 'KE' || currency === 'KES';

  if (isKenya) {
    return {
      method: 'MPESA' as PaymentMethodCode,
      label: 'M-Pesa',
      transactionLabel: 'M-Pesa Transaction Code',
      placeholder: 'e.g. QGH123ABC4',
      description: 'Pay via M-Pesa using the landlord payment details, then upload the confirmation.',
      helpText: 'Found in your M-Pesa confirmation SMS. Leave blank if unsure, but upload the receipt screenshot.',
      submitCopy: 'Pay with M-Pesa, then enter your transaction details below.',
    };
  }

  return {
    method: 'MOMO' as PaymentMethodCode,
    label: 'MTN MoMo',
    transactionLabel: 'MoMo Transaction ID',
    placeholder: 'MP26...',
    description: 'Pay via Mobile Money, then upload the confirmation.',
    helpText: 'Found in your MoMo confirmation SMS. Leave blank if unsure, but upload the receipt screenshot.',
    submitCopy: 'Pay via Mobile Money, then enter your transaction details below.',
  };
};

export const formatPaymentMethod = (method?: string | null) => {
  if (method === 'MPESA') return 'M-Pesa';
  if (method === 'MOMO') return 'MTN MoMo';
  if (method === 'BANK_TRANSFER') return 'Bank Transfer';
  return method?.replace('_', ' ') ?? '';
};
