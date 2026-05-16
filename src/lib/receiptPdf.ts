import { jsPDF } from 'jspdf';
import { formatDate, formatRWF } from '@/hooks/useSupabaseData';

type ReceiptLike = {
  receipt_number: string;
  generated_at: string;
  invoice?: {
    invoice_number?: string | null;
    billing_period_start?: string | null;
    billing_period_end?: string | null;
    amount_due?: number | null;
  } | null;
  payment?: {
    amount?: number | null;
    payment_method?: string | null;
    transaction_id?: string | null;
  } | null;
  tenant?: {
    full_name?: string | null;
  } | null;
  unit?: {
    unit?: {
      unit_number?: string | null;
      property?: {
        name?: string | null;
      } | null;
    } | null;
  } | null;
};

export function downloadReceiptPdf(receipt: ReceiptLike, organisationName = 'BizRent') {
  const doc = new jsPDF();
  const invoice = receipt.invoice ?? {};
  const payment = receipt.payment ?? {};
  const tenant = receipt.tenant ?? {};
  const unit = receipt.unit?.unit;
  const paidAmount = Number(payment.amount ?? invoice.amount_due ?? 0);
  const propertyUnit = [unit?.property?.name, unit?.unit_number ? `Unit ${unit.unit_number}` : null]
    .filter(Boolean)
    .join(' — ');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(organisationName, 20, 24);

  doc.setFontSize(16);
  doc.text('Official Payment Receipt', 20, 38);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(20, 44, 190, 44);

  const rows: Array<[string, string]> = [
    ['Receipt Number', receipt.receipt_number],
    ['Receipt Date', formatDate(receipt.generated_at)],
    ['Invoice Number', invoice.invoice_number ?? '—'],
    ['Tenant', tenant.full_name ?? '—'],
    ['Property / Unit', propertyUnit || '—'],
    ['Billing Period', invoice.billing_period_start
      ? `${formatDate(invoice.billing_period_start)}${invoice.billing_period_end ? ` - ${formatDate(invoice.billing_period_end)}` : ''}`
      : '—'],
    ['Amount Paid', formatRWF(paidAmount)],
    ['Payment Method', payment.payment_method ?? '—'],
    ['Transaction ID', payment.transaction_id ?? '—'],
  ];

  let y = 58;
  doc.setFontSize(11);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 72, y);
    y += 10;
  });

  doc.setDrawColor(220);
  doc.line(20, y + 4, 190, y + 4);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text('This receipt confirms payment recorded in BizRent.', 20, y + 16);

  doc.save(`${receipt.receipt_number}.pdf`);
}
