import type { Recommendation } from "@/lib/types";

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  loading: boolean;
}

export function RecommendationsSection({
  recommendations,
  loading,
}: RecommendationsSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
        <h3 className="text-lg font-semibold">🎯 Recommendations</h3>
        <p className="mt-1 text-sm text-slate-400">
          Actionable findings from an external AI/GEO audit.
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded bg-slate-200" />
                <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <ol className="space-y-4">
            {recommendations.map((item, index) => (
              <li
                key={item.title}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {index + 1}. {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.action}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
