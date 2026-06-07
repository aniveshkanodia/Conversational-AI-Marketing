import type { Brief, QueryResult } from "@/lib/types";
import {
  extractSnippet,
  getBrandPosition,
  getCompetitorMentions,
  positionBadge,
} from "@/lib/utils";

interface VisibilitySectionProps {
  brief: Brief;
  queries: QueryResult[];
  competitors: string[];
}

export function VisibilitySection({
  brief,
  queries,
  competitors,
}: VisibilitySectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-lg font-semibold">🔍 Visibility</h3>
          <div className="text-xs text-slate-300">
            <span className="font-medium text-white">Running on:</span>{" "}
            <span className="rounded bg-emerald-700 px-2 py-0.5">Claude ✓ live</span>{" "}
            <span className="rounded bg-slate-700 px-2 py-0.5 text-slate-400">
              GPT-4 · coming soon
            </span>{" "}
            <span className="rounded bg-slate-700 px-2 py-0.5 text-slate-400">
              Gemini · coming soon
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Multi-model comparison shows how brands perform differently across AI
          systems. GPT-4 and Gemini powered in full version.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Consumer query</th>
              <th className="px-4 py-3 font-medium">Your position</th>
              <th className="px-4 py-3 font-medium">What AI said</th>
              <th className="px-4 py-3 font-medium">Other brands mentioned</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((result) => {
              const position = getBrandPosition(result, brief.brand);
              const badge = positionBadge(position);
              const snippet = extractSnippet(result.response, brief.brand, 40, 40);
              const competitorMentions = getCompetitorMentions(
                result,
                brief.brand,
                competitors,
              );

              return (
                <tr key={result.query} className="border-t border-slate-100">
                  <td className="px-4 py-3 align-top text-slate-800">
                    {result.query}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    <HighlightedSnippet text={snippet} brand={brief.brand} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    {competitorMentions.length > 0
                      ? competitorMentions
                          .map(
                            (mention) =>
                              `${mention.brand} (${mention.position}${mention.position === 1 ? "st" : mention.position === 2 ? "nd" : mention.position === 3 ? "rd" : "th"})`,
                          )
                          .join(", ")
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HighlightedSnippet({
  text,
  brand,
}: {
  text: string;
  brand: string;
}) {
  const pattern = new RegExp(`(${brand})`, "gi");
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === brand.toLowerCase() ? (
          <mark key={index} className="rounded bg-amber-100 px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}
