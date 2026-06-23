import { BarChart3, Building2, FileCheck2, ReceiptText, ShieldCheck, UserRoundCog } from 'lucide-react';

const FEATURES = [
  {
    icon: Building2,
    title: 'Properties, units and tenants',
    copy: 'Keep every property, unit, tenant, lease and billing cycle connected instead of spread across separate files.',
  },
  {
    icon: FileCheck2,
    title: 'Flexible first billing',
    copy: 'Ask for deposit first, rent first, prorated rent, or a custom start arrangement when inviting tenants.',
  },
  {
    icon: ShieldCheck,
    title: 'Payment proof review',
    copy: 'Review screenshots and transaction references before money is marked as paid in the ledger.',
  },
  {
    icon: ReceiptText,
    title: 'Receipts tenants can trust',
    copy: 'Approved payments create records tenants can return to instead of asking you to resend proof.',
  },
  {
    icon: UserRoundCog,
    title: 'Landlord and tenant switching',
    copy: 'A user can be a landlord and tenant in the same organisation and switch context without a second account.',
  },
  {
    icon: BarChart3,
    title: 'Operational reporting',
    copy: 'Track outstanding rent, paid rent, deposits, approvals and collection history by property.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#08111F] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">Features</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              Built for the messy middle of rent collection.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The product is not trying to be generic accounting software. It focuses on the daily work landlords actually repeat.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#10B981]/10 text-[#10B981]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
