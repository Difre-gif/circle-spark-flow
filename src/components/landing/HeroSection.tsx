import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, ReceiptText, ShieldCheck } from 'lucide-react';

function PaymentRow({
  name,
  unit,
  amount,
  status,
}: {
  name: string;
  unit: string;
  amount: string;
  status: 'Review' | 'Paid' | 'Late';
}) {
  const colors = {
    Review: 'bg-[#FEF3C7] text-[#92400E]',
    Paid: 'bg-[#DCFCE7] text-[#166534]',
    Late: 'bg-[#FEE2E2] text-[#991B1B]',
  };

  return (
    <div className="grid min-w-0 gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 shadow-sm sm:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-950">{name}</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{unit}</p>
      </div>
      <div className="min-w-0 sm:text-right">
        <p className="font-mono text-sm font-bold text-[#1E3A8A]">{amount}</p>
        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${colors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
      <div className="min-w-0 rounded-md bg-[#F8FAFC] p-4">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Collection workspace</p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">East Africa Homes</p>
          </div>
          <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#166534]">Live</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ['KES 742k', 'Collected'],
            ['3', 'Need review'],
            ['91%', 'Collection'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-md border border-slate-200 bg-white p-3">
              <p className="font-mono text-lg font-extrabold text-[#1E3A8A]">{value}</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <PaymentRow name="Fredrick Nj. Kariuki" unit="A-001, Sunrise Apartments" amount="KES 20,000" status="Review" />
          <PaymentRow name="Aline Uwase" unit="B-014, Remera Court" amount="RWF 180,000" status="Paid" />
          <PaymentRow name="Kevin Otieno" unit="Shop 07, Westlands" amount="KES 35,000" status="Late" />
        </div>

        <div className="mt-4 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] p-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-[#1E3A8A]" />
            <div>
              <p className="text-sm font-bold text-slate-950">Payment proof matched to invoice</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Transaction code, amount, tenant and receipt history stay in one audit trail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative isolate max-w-full overflow-hidden bg-[#08111F] pt-24 text-white sm:pt-32">
      <img
        src="/hero-background.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 -z-10 bg-[#08111F]/88" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-28">
        <div className="min-w-0">
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#A7F3D0]">
            Built for Rwanda and Kenya
          </div>
          <h1 className="max-w-3xl break-words text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Rent collection without the WhatsApp chaos.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            BizRent gives landlords and property managers one place to invoice tenants, verify M-Pesa or MoMo payment proof,
            issue receipts, and see who has paid in real time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#10B981] px-5 py-3 text-sm font-extrabold text-[#07111F] shadow-lg shadow-emerald-950/30 transition-colors hover:bg-[#34D399] sm:w-auto"
            >
              Start free for 30 days
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              See the workflow
            </a>
          </div>

          <div className="mt-8 grid max-w-xl gap-3 text-sm text-slate-300 sm:grid-cols-3">
            {[
              [CheckCircle2, 'No card required'],
              [Clock3, 'Setup in minutes'],
              [ReceiptText, 'Receipts included'],
            ].map(([Icon, label]) => (
              <div key={label as string} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#10B981]" />
                <span>{label as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
