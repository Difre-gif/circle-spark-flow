import { CheckCircle2, Clock3, FileText, Home, Users } from 'lucide-react';

function Metric({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4 text-[#1E3A8A]" />
        <span className="text-xs font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-3 font-mono text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function QueueItem({
  tenant,
  invoice,
  amount,
  method,
}: {
  tenant: string;
  invoice: string;
  amount: string;
  method: string;
}) {
  return (
    <div className="grid gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center">
      <div>
        <p className="font-bold text-slate-950">{tenant}</p>
        <p className="mt-1 text-sm text-slate-500">{invoice}</p>
      </div>
      <div>
        <p className="font-mono font-bold text-[#1E3A8A]">{amount}</p>
        <p className="mt-1 text-sm text-slate-500">{method}</p>
      </div>
      <button className="min-h-[44px] rounded-md bg-[#1E3A8A] px-4 text-sm font-bold text-white">
        Review
      </button>
    </div>
  );
}

export default function DashboardPreviewSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">Product preview</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              See the whole collection operation in one workspace.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              A landlord should not need five spreadsheets to answer one question: who paid, who owes, and what proof exists?
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 shadow-xl shadow-slate-200/70">
            <div className="rounded-md bg-white p-4">
              <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-extrabold text-slate-950">Landlord Dashboard</p>
                  <p className="text-sm text-slate-500">June collections across 4 properties</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#166534]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Balanced
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric icon={Home} label="Units" value="42" />
                <Metric icon={Users} label="Tenants" value="39" />
                <Metric icon={Clock3} label="Pending" value="3" />
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-3">
                  <FileText className="h-4 w-4 text-[#1E3A8A]" />
                  <p className="text-sm font-extrabold text-slate-950">Payments waiting for review</p>
                </div>
                <QueueItem tenant="Fredrick Njoroge Kariuki" invoice="INV-2026-000009, A-001" amount="KES 20,000" method="M-Pesa deposit proof" />
                <QueueItem tenant="Ineza Sandrine" invoice="INV-2026-000018, B-203" amount="RWF 180,000" method="MTN MoMo rent proof" />
                <QueueItem tenant="Kevin Otieno" invoice="INV-2026-000021, Shop 07" amount="KES 35,000" method="Bank transfer proof" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
