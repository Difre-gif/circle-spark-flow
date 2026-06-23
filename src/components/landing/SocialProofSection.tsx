const STATS = [
  { value: '3 min', label: 'Typical payment review time' },
  { value: '2 countries', label: 'Kenya and Rwanda context built in' },
  { value: '1 ledger', label: 'Invoices, proof, receipts and reports' },
  { value: '0 guesswork', label: 'Clear balances for tenant and landlord' },
];

const QUOTES = [
  {
    quote: 'The main value is not only tracking money. It is that every tenant conversation now has a record behind it.',
    name: 'Property manager',
    location: 'Nairobi',
  },
  {
    quote: 'Deposit-first billing is exactly how many landlords work here. The software now explains that to the tenant clearly.',
    name: 'Landlord',
    location: 'Kigali',
  },
];

export default function SocialProofSection() {
  return (
    <section id="testimonials" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-6">
              <p className="font-mono text-3xl font-black text-[#1E3A8A]">{stat.value}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">Operator confidence</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Designed for people who manage rent every month.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {QUOTES.map((item) => (
              <figure key={item.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <blockquote className="text-lg font-semibold leading-8 text-slate-950">"{item.quote}"</blockquote>
                <figcaption className="mt-6 border-t border-slate-200 pt-4 text-sm font-bold text-slate-600">
                  {item.name} <span className="font-medium text-slate-400">- {item.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
