import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinalCTASection() {
  return (
    <section className="bg-[#08111F] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10B981]">Ready when you are</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
                Give your tenants a clearer way to pay and your team a clearer way to manage.
              </h2>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-300">
                {['No card required', '30-day trial', 'Landlord and tenant portals'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/register"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-[#10B981] px-6 text-base font-black text-[#07111F] transition-colors hover:bg-[#34D399]"
            >
              Start free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
