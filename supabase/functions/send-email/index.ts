import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Senders ─────────────────────────────────────────────────────────────────
const SENDERS = {
  noreply: "BizRent <noreply@bizrent.rw>",
  hello:   "BizRent <hello@bizrent.rw>",
  alerts:  "BizRent Alerts <alerts@bizrent.rw>",
};

function resolveSender(type: string): string {
  if (["welcome-landlord", "tenant-invitation", "staff-invitation"].includes(type)) return SENDERS.hello;
  if (["payment-submitted", "overdue-alert"].includes(type)) return SENDERS.alerts;
  return SENDERS.noreply;
}

// ─── Brand CSS ───────────────────────────────────────────────────────────────
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         background: #f0f4f8; color: #1e293b; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff;
             border-radius: 12px; overflow: hidden;
             box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { padding: 40px 40px 32px; text-align: center; }
  .header-default  { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); }
  .header-success  { background: linear-gradient(135deg, #064e3b 0%, #059669 100%); }
  .header-warning  { background: linear-gradient(135deg, #92400e 0%, #d97706 100%); }
  .header-danger   { background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); }
  .header-overdue  { background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%); }
  .header .logo-wrap { margin-bottom: 20px; }
  .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3; }
  .header p  { color: rgba(255,255,255,0.80); font-size: 14px; margin-top: 6px; }
  .body { padding: 36px 40px; }
  .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
  .intro    { font-size: 14px; color: #475569; line-height: 1.65; margin-bottom: 28px; }
  .details-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  .details-table tr:not(:last-child) td { border-bottom: 1px solid #e2e8f0; }
  .details-table td { padding: 10px 0; font-size: 13px; vertical-align: top; }
  .details-table td:first-child { color: #64748b; font-weight: 500; width: 42%; }
  .details-table td:last-child  { color: #0f172a; font-weight: 600; text-align: right; }
  .alert { border-radius: 8px; padding: 16px 18px; margin-bottom: 24px; font-size: 13px; }
  .alert-success { background: #d1fae5; border-left: 4px solid #059669; color: #065f46; }
  .alert-warning { background: #fef3c7; border-left: 4px solid #d97706; color: #92400e; }
  .alert-danger  { background: #fee2e2; border-left: 4px solid #dc2626; color: #991b1b; }
  .alert-info    { background: #dbeafe; border-left: 4px solid #2563eb; color: #1e40af; }
  .alert .alert-title { font-weight: 700; margin-bottom: 4px; }
  .cta-wrap { text-align: center; margin: 24px 0; }
  .cta { display: inline-block; padding: 14px 32px; border-radius: 8px;
         background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
         color: #ffffff !important; font-size: 14px; font-weight: 700;
         text-decoration: none; letter-spacing: 0.3px; }
  .steps { margin-bottom: 24px; }
  .step  { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .step:last-child { border-bottom: none; }
  .step-num { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
              background: #1e3a5f; color: #fff; font-size: 11px; font-weight: 700;
              display: flex; align-items: center; justify-content: center; }
  .step-text { font-size: 13px; color: #334155; padding-top: 3px; }
  .amount-chip { display: inline-block; background: #f0f9ff; border: 1.5px solid #bae6fd;
                 border-radius: 8px; padding: 12px 20px; margin: 0 0 24px;
                 font-size: 22px; font-weight: 800; color: #0369a1; }
  .tenant-row { display: flex; justify-content: space-between; align-items: center;
                padding: 10px 14px; border-radius: 8px; margin-bottom: 8px;
                background: #fff7ed; border: 1px solid #fed7aa; }
  .tenant-row .t-name { font-size: 13px; font-weight: 600; color: #0f172a; }
  .tenant-row .t-meta { font-size: 12px; color: #64748b; }
  .tenant-row .t-amount { font-size: 13px; font-weight: 700; color: #dc2626; }
  .footer { background: #f8fafc; padding: 24px 40px; text-align: center;
            border-top: 1px solid #e2e8f0; }
  .footer p { font-size: 11px; color: #94a3b8; line-height: 1.7; }
  .footer a { color: #64748b; text-decoration: none; }
  @media (max-width: 620px) {
    .wrapper { margin: 0; border-radius: 0; }
    .body, .header, .footer { padding: 24px 20px; }
  }
`;

// ─── Logo SVG ────────────────────────────────────────────────────────────────
const LOGO_SVG = `<svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#1e3a5f"/>
  <path d="M16 8 L26 15 L26 28 L6 28 L6 15 Z" fill="#ffffff" opacity="0.9"/>
  <path d="M10 22 L10 28 L14 28 L14 22 Z M18 22 L18 28 L22 28 L22 22 Z" fill="#1e3a5f"/>
  <path d="M14 22 L18 22 L18 26 L14 26 Z" fill="#1e3a5f"/>
  <path d="M16 6 L28 14" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
  <text x="38" y="22" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="#ffffff">BizRent</text>
</svg>`;

// ─── Icons ───────────────────────────────────────────────────────────────────
const ICON = {
  building: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7l9-4 9 4M4 11h16v10H4z"/></svg>`,
  check:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  clock:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  xCircle:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>`,
  bell:     `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  smile:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  user:     `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

// ─── HTML wrapper ─────────────────────────────────────────────────────────────
interface BuildEmailOpts {
  headerClass: string;
  headerIcon: string;
  headerTitle: string;
  headerSubtitle?: string;
  body: string;
  previewText?: string;
}

function buildEmail(opts: BuildEmailOpts): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>${opts.headerTitle}</title>
  ${opts.previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.previewText}&nbsp;&#8199;&#65279;&#847;</div>` : ""}
  <style>${BASE_CSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header ${opts.headerClass}">
    <div class="logo-wrap">${LOGO_SVG}</div>
    <h1>${opts.headerIcon} ${opts.headerTitle}</h1>
    ${opts.headerSubtitle ? `<p>${opts.headerSubtitle}</p>` : ""}
  </div>
  <div class="body">
    ${opts.body}
  </div>
  <div class="footer">
    <p>BizRent — Property Management Platform<br/>
    Kigali, Rwanda &nbsp;|&nbsp; <a href="mailto:support@bizrent.rw">support@bizrent.rw</a><br/>
    <small>You received this email because of your activity on BizRent. Do not reply directly to this email.</small></p>
  </div>
</div>
</body>
</html>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtAmount(n: number): string {
  return `RWF ${n.toLocaleString("en-US")}`;
}
function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

// ─── 1. welcome-landlord ──────────────────────────────────────────────────────
function buildWelcomeLandlord(data: { name: string; orgName: string }) {
  const subject = "Your BizRent account is ready";
  const html = buildEmail({
    headerClass: "header-success",
    headerIcon: ICON.smile,
    headerTitle: "Welcome to BizRent!",
    headerSubtitle: "Your organisation has been created successfully",
    previewText: `Hi ${data.name}, your BizRent account for ${data.orgName} is ready.`,
    body: `
      <p class="greeting">Hi ${data.name},</p>
      <p class="intro">
        Your BizRent account and organisation <strong>${data.orgName}</strong> have been set up and are ready to use.
        You can now start adding your properties, units, and tenants.
      </p>
      <div class="alert alert-success">
        <div class="alert-title">Account activated</div>
        Your free trial is now active. Explore all features with no restrictions.
      </div>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div class="step-text"><strong>Add a property</strong> — Go to Properties and create your first building.</div></div>
        <div class="step"><div class="step-num">2</div><div class="step-text"><strong>Create units</strong> — Define the individual units/rooms within each property.</div></div>
        <div class="step"><div class="step-num">3</div><div class="step-text"><strong>Invite tenants</strong> — Send invitations and let BizRent handle invoicing automatically.</div></div>
      </div>
      <div class="cta-wrap">
        <a class="cta" href="https://bizrent.rw/landlord">Go to my Dashboard</a>
      </div>
      <p class="intro">Questions? Reach us at <a href="mailto:support@bizrent.rw">support@bizrent.rw</a>.</p>
    `,
  });
  return { subject, html };
}

// ─── 2. tenant-invitation ─────────────────────────────────────────────────────
function buildTenantInvitation(data: { orgName: string; inviterName: string; unitInfo?: string }) {
  const subject = `You've been invited to join ${data.orgName} on BizRent`;
  const html = buildEmail({
    headerClass: "header-default",
    headerIcon: ICON.building,
    headerTitle: "You have a new invitation",
    headerSubtitle: `${data.inviterName} has invited you to BizRent`,
    previewText: `${data.inviterName} from ${data.orgName} has invited you to manage your tenancy on BizRent.`,
    body: `
      <p class="greeting">Hello,</p>
      <p class="intro">
        <strong>${data.inviterName}</strong> from <strong>${data.orgName}</strong> has invited you to BizRent —
        Rwanda's property management platform where you can view invoices, submit payments, and manage your tenancy.
      </p>
      <table class="details-table">
        <tr><td>Organisation</td><td>${data.orgName}</td></tr>
        ${data.unitInfo ? `<tr><td>Your Unit</td><td>${data.unitInfo}</td></tr>` : ""}
        <tr><td>Invited by</td><td>${data.inviterName}</td></tr>
      </table>
      <div class="alert alert-info">
        <div class="alert-title">How it works</div>
        Sign up with this email address and you will be automatically linked to ${data.orgName}.
      </div>
      <div class="cta-wrap">
        <a class="cta" href="https://bizrent.rw/register">Accept Invitation &amp; Sign Up</a>
      </div>
    `,
  });
  return { subject, html };
}

// ─── 3. staff-invitation ──────────────────────────────────────────────────────
function buildStaffInvitation(data: { orgName: string; inviterName: string; role: string }) {
  const roleLabel = data.role === "MANAGER" ? "Property Manager" : data.role === "ACCOUNTANT" ? "Accountant" : data.role;
  const subject = `You've been invited to join ${data.orgName} as ${roleLabel}`;
  const html = buildEmail({
    headerClass: "header-default",
    headerIcon: ICON.user,
    headerTitle: "Staff Invitation",
    headerSubtitle: `${data.inviterName} is inviting you to BizRent`,
    previewText: `You have been invited to join ${data.orgName} on BizRent as ${roleLabel}.`,
    body: `
      <p class="greeting">Hello,</p>
      <p class="intro">
        <strong>${data.inviterName}</strong> has invited you to join <strong>${data.orgName}</strong> on BizRent
        in the role of <strong>${roleLabel}</strong>.
      </p>
      <table class="details-table">
        <tr><td>Organisation</td><td>${data.orgName}</td></tr>
        <tr><td>Your Role</td><td>${roleLabel}</td></tr>
        <tr><td>Invited by</td><td>${data.inviterName}</td></tr>
      </table>
      <div class="alert alert-info">
        <div class="alert-title">Getting started</div>
        Sign up with this email address and you will be automatically linked with the correct permissions.
      </div>
      <div class="cta-wrap">
        <a class="cta" href="https://bizrent.rw/register">Accept Invitation &amp; Sign Up</a>
      </div>
    `,
  });
  return { subject, html };
}

// ─── 4. invoice-due ───────────────────────────────────────────────────────────
function buildInvoiceDue(data: {
  tenantName: string; orgName: string; invoiceNumber: string;
  propertyUnit: string; period: string; dueDate: string;
  amountDue: number; payUrl?: string;
}) {
  const subject = `Invoice ${data.invoiceNumber} is due — ${fmtAmount(data.amountDue)}`;
  const html = buildEmail({
    headerClass: "header-warning",
    headerIcon: ICON.clock,
    headerTitle: "Payment Due",
    headerSubtitle: `Invoice ${data.invoiceNumber} from ${data.orgName}`,
    previewText: `Your rent payment of ${fmtAmount(data.amountDue)} is due on ${fmtDate(data.dueDate)}.`,
    body: `
      <p class="greeting">Hi ${data.tenantName},</p>
      <p class="intro">This is a reminder that your rent invoice is due for payment. Please review the details and pay before the due date to avoid any late fees.</p>
      <div class="amount-chip">${fmtAmount(data.amountDue)}</div>
      <table class="details-table">
        <tr><td>Invoice #</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Property / Unit</td><td>${data.propertyUnit}</td></tr>
        <tr><td>Billing Period</td><td>${fmtDate(data.period)}</td></tr>
        <tr><td>Due Date</td><td><strong>${fmtDate(data.dueDate)}</strong></td></tr>
        <tr><td>Amount Due</td><td><strong>${fmtAmount(data.amountDue)}</strong></td></tr>
        <tr><td>Organisation</td><td>${data.orgName}</td></tr>
      </table>
      <div class="alert alert-warning">
        <div class="alert-title">Payment instructions</div>
        After making your payment, submit your proof of payment through the BizRent tenant portal.
      </div>
      <div class="cta-wrap">
        <a class="cta" href="${data.payUrl ?? "https://bizrent.rw/tenant/invoices"}">Submit Payment Proof</a>
      </div>
    `,
  });
  return { subject, html };
}

// ─── 5. invoice-overdue (tenant notification) ─────────────────────────────────
function buildInvoiceOverdue(data: {
  tenantName: string; orgName: string; invoiceNumber: string;
  propertyUnit: string; period: string; dueDate: string;
  amountDue: number; daysOverdue: number; payUrl?: string;
}) {
  const subject = `Overdue: Invoice ${data.invoiceNumber} — ${fmtAmount(data.amountDue)}`;
  const html = buildEmail({
    headerClass: "header-danger",
    headerIcon: ICON.bell,
    headerTitle: "Rent Payment Overdue",
    headerSubtitle: `Invoice ${data.invoiceNumber} from ${data.orgName}`,
    previewText: `Your rent payment of ${fmtAmount(data.amountDue)} is ${data.daysOverdue} day(s) overdue.`,
    body: `
      <p class="greeting">Hi ${data.tenantName},</p>
      <p class="intro">Your rent invoice is now overdue. Please make your payment as soon as possible to avoid any further issues with your tenancy.</p>
      <div class="alert alert-danger">
        <div class="alert-title">Payment overdue by ${data.daysOverdue} day${data.daysOverdue !== 1 ? "s" : ""}</div>
        Please submit your payment proof immediately to clear this balance.
      </div>
      <div class="amount-chip">${fmtAmount(data.amountDue)}</div>
      <table class="details-table">
        <tr><td>Invoice #</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Property / Unit</td><td>${data.propertyUnit}</td></tr>
        <tr><td>Billing Period</td><td>${fmtDate(data.period)}</td></tr>
        <tr><td>Original Due Date</td><td><strong>${fmtDate(data.dueDate)}</strong></td></tr>
        <tr><td>Amount Overdue</td><td><strong>${fmtAmount(data.amountDue)}</strong></td></tr>
        <tr><td>Organisation</td><td>${data.orgName}</td></tr>
      </table>
      <div class="cta-wrap">
        <a class="cta" href="${data.payUrl ?? "https://bizrent.rw/tenant/invoices"}">Submit Payment Now</a>
      </div>
      <p class="intro">If you have already made this payment, please submit your proof of payment through the BizRent portal so your landlord can verify it.</p>
    `,
  });
  return { subject, html };
}

// ─── 6. payment-submitted ─────────────────────────────────────────────────────
function buildPaymentSubmitted(data: {
  landlordName: string; tenantName: string; amount: number;
  propertyUnit: string; invoiceNumber: string; transactionId?: string;
  submittedAt: string; reviewUrl?: string;
}) {
  const subject = `Payment received for review — ${data.tenantName}`;
  const html = buildEmail({
    headerClass: "header-default",
    headerIcon: ICON.clock,
    headerTitle: "New Payment Submitted",
    headerSubtitle: "Awaiting your review and approval",
    previewText: `${data.tenantName} has submitted a payment of ${fmtAmount(data.amount)} for your review.`,
    body: `
      <p class="greeting">Hi ${data.landlordName},</p>
      <p class="intro">A tenant has submitted a payment proof. Please verify and approve or reject it from your dashboard.</p>
      <div class="amount-chip">${fmtAmount(data.amount)}</div>
      <table class="details-table">
        <tr><td>Tenant</td><td>${data.tenantName}</td></tr>
        <tr><td>Invoice #</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Property / Unit</td><td>${data.propertyUnit}</td></tr>
        ${data.transactionId ? `<tr><td>Transaction ID</td><td>${data.transactionId}</td></tr>` : ""}
        <tr><td>Submitted At</td><td>${fmtDate(data.submittedAt)}</td></tr>
      </table>
      <div class="alert alert-info">
        <div class="alert-title">Action required</div>
        Log in to your BizRent dashboard to approve or reject this payment.
      </div>
      <div class="cta-wrap">
        <a class="cta" href="${data.reviewUrl ?? "https://bizrent.rw/landlord/payments"}">Review Payment</a>
      </div>
    `,
  });
  return { subject, html };
}

// ─── 6. payment-approved ──────────────────────────────────────────────────────
function buildPaymentApproved(data: {
  tenantName: string; orgName: string; amount: number; invoiceNumber: string;
  propertyUnit: string; period: string; transactionId?: string;
  approvedBy: string; approvedAt: string; receiptUrl?: string; receiptNumber?: string;
}) {
  const subject = `Payment approved — ${data.invoiceNumber}`;
  const html = buildEmail({
    headerClass: "header-success",
    headerIcon: ICON.check,
    headerTitle: "Payment Approved",
    headerSubtitle: "Your payment has been confirmed",
    previewText: `Your payment of ${fmtAmount(data.amount)} for invoice ${data.invoiceNumber} has been approved.`,
    body: `
      <p class="greeting">Hi ${data.tenantName},</p>
      <p class="intro">Your payment has been reviewed and approved by <strong>${data.approvedBy}</strong>. Your account is now up to date.</p>
      <div class="alert alert-success">
        <div class="alert-title">Payment confirmed</div>
        Your payment has been successfully verified and your invoice has been updated.
      </div>
      <div class="amount-chip">${fmtAmount(data.amount)}</div>
      <table class="details-table">
        <tr><td>Invoice #</td><td>${data.invoiceNumber}</td></tr>
        ${data.receiptNumber ? `<tr><td>Receipt #</td><td>${data.receiptNumber}</td></tr>` : ""}
        <tr><td>Property / Unit</td><td>${data.propertyUnit}</td></tr>
        <tr><td>Billing Period</td><td>${fmtDate(data.period)}</td></tr>
        ${data.transactionId ? `<tr><td>Transaction ID</td><td>${data.transactionId}</td></tr>` : ""}
        <tr><td>Approved By</td><td>${data.approvedBy}</td></tr>
        <tr><td>Approved At</td><td>${fmtDate(data.approvedAt)}</td></tr>
        <tr><td>Organisation</td><td>${data.orgName}</td></tr>
      </table>
      <div class="cta-wrap">
        <a class="cta" href="${data.receiptUrl ?? "https://bizrent.rw/tenant/receipts"}">View My Receipts</a>
      </div>
    `,
  });
  return { subject, html };
}

// ─── 7. payment-rejected ──────────────────────────────────────────────────────
function buildPaymentRejected(data: {
  tenantName: string; orgName: string; amount: number; invoiceNumber: string;
  propertyUnit: string; period: string; transactionId?: string;
  rejectionReason: string; resubmitUrl?: string;
}) {
  const subject = `Payment rejected — Action required for ${data.invoiceNumber}`;
  const html = buildEmail({
    headerClass: "header-danger",
    headerIcon: ICON.xCircle,
    headerTitle: "Payment Rejected",
    headerSubtitle: "Please review and resubmit your payment",
    previewText: `Your payment for invoice ${data.invoiceNumber} was not approved. Please resubmit.`,
    body: `
      <p class="greeting">Hi ${data.tenantName},</p>
      <p class="intro">Unfortunately your payment for invoice <strong>${data.invoiceNumber}</strong> could not be approved. Please review the reason below and resubmit with the correct details.</p>
      <div class="alert alert-danger">
        <div class="alert-title">Rejection reason</div>
        ${data.rejectionReason}
      </div>
      <table class="details-table">
        <tr><td>Invoice #</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Property / Unit</td><td>${data.propertyUnit}</td></tr>
        <tr><td>Billing Period</td><td>${fmtDate(data.period)}</td></tr>
        <tr><td>Amount</td><td>${fmtAmount(data.amount)}</td></tr>
        ${data.transactionId ? `<tr><td>Transaction ID</td><td>${data.transactionId}</td></tr>` : ""}
        <tr><td>Organisation</td><td>${data.orgName}</td></tr>
      </table>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div class="step-text">Verify that your payment was processed by your bank or mobile money provider.</div></div>
        <div class="step"><div class="step-num">2</div><div class="step-text">Ensure the transaction ID and amount exactly match your payment receipt.</div></div>
        <div class="step"><div class="step-num">3</div><div class="step-text">Resubmit with the corrected details and a clear screenshot of your payment proof.</div></div>
      </div>
      <div class="cta-wrap">
        <a class="cta" href="${data.resubmitUrl ?? "https://bizrent.rw/tenant/invoices"}">Resubmit Payment</a>
      </div>
      <p class="intro">If you believe this is a mistake, please contact your property manager directly.</p>
    `,
  });
  return { subject, html };
}

// ─── 8. overdue-alert ─────────────────────────────────────────────────────────
function buildOverdueAlert(data: {
  landlordName: string;
  tenants: Array<{ name: string; unit: string; amount: number; daysOverdue: number }>;
  reviewUrl?: string;
}) {
  const rows = data.tenants.map(t => `
    <div class="tenant-row">
      <div>
        <div class="t-name">${t.name}</div>
        <div class="t-meta">${t.unit} &nbsp;&middot;&nbsp; ${t.daysOverdue} day${t.daysOverdue !== 1 ? "s" : ""} overdue</div>
      </div>
      <div class="t-amount">${fmtAmount(t.amount)}</div>
    </div>`).join("");

  const totalOwed = data.tenants.reduce((s, t) => s + t.amount, 0);
  const subject = `Overdue rent alert — ${data.tenants.length} tenant${data.tenants.length !== 1 ? "s" : ""} overdue`;

  const html = buildEmail({
    headerClass: "header-overdue",
    headerIcon: ICON.bell,
    headerTitle: "Overdue Rent Alert",
    headerSubtitle: `${data.tenants.length} tenant${data.tenants.length !== 1 ? "s have" : " has"} outstanding balances`,
    previewText: `${data.tenants.length} tenant(s) have overdue rent totalling ${fmtAmount(totalOwed)}.`,
    body: `
      <p class="greeting">Hi ${data.landlordName},</p>
      <p class="intro">The following tenants have overdue rent payments. We recommend reaching out to them promptly.</p>
      <div class="amount-chip">${fmtAmount(totalOwed)} total outstanding</div>
      ${rows}
      <div class="alert alert-warning">
        <div class="alert-title">Tip</div>
        BizRent automatically sends payment reminders to tenants. You can also message tenants directly from the dashboard.
      </div>
      <div class="cta-wrap">
        <a class="cta" href="${data.reviewUrl ?? "https://bizrent.rw/landlord/payments"}">View Overdue Payments</a>
      </div>
    `,
  });
  return { subject, html };
}

// ─── Email type router ────────────────────────────────────────────────────────
function buildEmailByType(type: string, data: Record<string, unknown>): { subject: string; html: string } {
  switch (type) {
    case "welcome-landlord":  return buildWelcomeLandlord(data as any);
    case "tenant-invitation": return buildTenantInvitation(data as any);
    case "staff-invitation":  return buildStaffInvitation(data as any);
    case "invoice-due":       return buildInvoiceDue(data as any);
    case "invoice-overdue":   return buildInvoiceOverdue(data as any);
    case "payment-submitted": return buildPaymentSubmitted(data as any);
    case "payment-approved":  return buildPaymentApproved(data as any);
    case "payment-rejected":  return buildPaymentRejected(data as any);
    case "overdue-alert":     return buildOverdueAlert(data as any);
    default: throw new Error(`Unknown email type: ${type}`);
  }
}

// ─── Request handler ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { to, type, data } = await req.json() as {
      to: string;
      type: string;
      data: Record<string, unknown>;
    };

    if (!to || !type || !data) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, type, data" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = buildEmailByType(type, data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resolveSender(type),
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[send-email] Resend error ${res.status}: ${err}`);
      return new Response(JSON.stringify({ error: err }), {
        status: res.status,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const result = await res.json();
    console.log(`[send-email] Sent '${type}' to ${to} → id:${result.id}`);

    return new Response(JSON.stringify({ id: result.id }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-email] Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
