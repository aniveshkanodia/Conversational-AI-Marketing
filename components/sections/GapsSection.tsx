import type { Brief, QueryResult } from "@/lib/types";
import { computeGapQueries } from "@/lib/utils";

interface GapsSectionProps {
  brief: Brief;
  queries: QueryResult[];
  competitors: string[];
}

export function GapsSection({
  brief,
  queries,
  competitors,
}: GapsSectionProps) {
  const gaps = computeGapQueries(queries, brief.brand, competitors);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
        <h3 className="text-lg font-semibold">⚠️ Competitive Gaps</h3>
        <p className="mt-1 text-sm text-slate-400">
          Queries where competitors appear but your brand does not.
        </p>
      </div>

      <div className="p-6">
        {gaps.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <span>✓</span>
            <span>
              No gaps — you appeared in all queries where competitors were
              mentioned.
            </span>
          </div>
        ) : (
          <ul className="space-y-3">
            {gaps.map((gap) => (
              <li
                key={gap.query}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{gap.query}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Competitors that appeared: {gap.competitorsAppeared.join(", ")}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                  Gap
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
