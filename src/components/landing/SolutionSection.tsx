import { ArrowRight, BadgeCheck, ClipboardList, CreditCard, ReceiptText } from 'lucide-react';

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Create a tenant billing plan',
    copy: 'Choose deposit first, rent first, prorated rent, or a custom first invoice when adding a tenant.',
  },
  {
    icon: CreditCard,
    title: 'Tenant submits payment proof',
    copy: 'Kenyan tenants see M-Pesa language. Rwandan tenants see MoMo language. The workflow matches their country.',
  },
  {
    icon: BadgeCheck,
    title: 'Landlord approves with context',
    copy: 'Review amount, transaction code, screenshot and invoice balance before approving or rejecting.',
  },
  {
    icon: ReceiptText,
    title: 'Receipts and reports update',
    copy: 'Approved payments create receipts and update the tenant, invoice, property and collection reports.',
  },
];

export default function SolutionSection() {
  return (
    <section id="how-it-works" className="bg-[#F8FAFC] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">How it works</p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
            A professional rent workflow from invite to receipt.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            BizRent turns the messy rent conversation into a simple operating process that both landlord and tenant can understand.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#EFF6FF] text-[#1E3A8A]">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-sm font-extrabold text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p>
              {index < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-9 hidden h-5 w-5 text-slate-300 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
