import { AlertTriangle, FileQuestion, MessagesSquare } from 'lucide-react';

const PROBLEMS = [
  {
    icon: MessagesSquare,
    title: 'Proof arrives everywhere',
    copy: 'Payment screenshots, transaction codes and promises sit inside WhatsApp chats instead of a searchable ledger.',
  },
  {
    icon: FileQuestion,
    title: 'Invoices are hard to match',
    copy: 'One tenant pays late, another pays deposit only, and a third pays through a relative. Manual matching breaks quickly.',
  },
  {
    icon: AlertTriangle,
    title: 'Disputes become personal',
    copy: 'Without receipts and history, landlords and tenants argue from memory instead of working from a shared record.',
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">The problem</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Rent collection is not failing because landlords are lazy.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            It fails because the tools are not built for how East African rent is actually paid: mobile money,
            screenshots, partial payments, deposits, late rent, and tenants who need clear receipts.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div key={problem.title} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-6">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-[#1E3A8A] shadow-sm">
                <problem.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950">{problem.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{problem.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
