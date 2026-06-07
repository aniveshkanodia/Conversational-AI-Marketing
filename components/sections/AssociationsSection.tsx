import type { Brief, QueryResult } from "@/lib/types";
import { extractSnippet } from "@/lib/utils";

interface AssociationsSectionProps {
  brief: Brief;
  queries: QueryResult[];
}

export function AssociationsSection({
  brief,
  queries,
}: AssociationsSectionProps) {
  const appearances = queries.filter((result) =>
    result.brandMentions.some(
      (mention) =>
        mention.brand.toLowerCase() === brief.brand.toLowerCase(),
    ),
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
        <h3 className="text-lg font-semibold">💬 Associations</h3>
        <p className="mt-1 text-sm text-slate-400">
          What AI chatbots say about your brand across discovery queries.
        </p>
      </div>

      <div className="space-y-4 p-6">
        {appearances.length === 0 ? (
          <p className="text-sm text-slate-600">
            Your brand was not mentioned in any AI responses for these queries.
          </p>
        ) : (
          appearances.map((result) => (
            <div
              key={result.query}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-sm font-medium text-slate-800">{result.query}</p>
              <p className="mt-2 text-sm italic text-slate-600">
                {extractSnippet(result.response, brief.brand, 60, 120)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
