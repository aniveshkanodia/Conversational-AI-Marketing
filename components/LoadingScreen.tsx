"use client";

import type { AnalysisState, Brief } from "@/lib/types";

interface LoadingScreenProps {
  brief: Brief;
  analysisState: AnalysisState;
}

const STAGE_MESSAGES: Record<AnalysisState["stage"], string> = {
  competitors: "Identifying key competitors...",
  queries: "Generating consumer discovery queries...",
  analyzing: "Querying AI",
  geo: "Running GEO content audit...",
  done: "Finalising report...",
};

function progressPercent(state: AnalysisState, hasGeo: boolean): number {
  const { stage, completedQueries, totalQueries } = state;

  if (stage === "competitors") return 10;
  if (stage === "queries") return 20;
  if (stage === "analyzing") {
    const queryProgress = totalQueries > 0 ? completedQueries / totalQueries : 0;
    return 20 + queryProgress * 60;
  }
  if (stage === "geo") return 90;
  return 100;
}

export function LoadingScreen({ brief, analysisState }: LoadingScreenProps) {
  const hasGeo = Boolean(brief.productContent?.trim());
  const progress = progressPercent(analysisState, hasGeo);
  const statusMessage =
    analysisState.stage === "analyzing" && analysisState.currentQuery
      ? `Querying AI: "${analysisState.currentQuery}"`
      : STAGE_MESSAGES[analysisState.stage];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium text-slate-500">
        {brief.brand} · {brief.category}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        Analysing AI discovery landscape
      </h2>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>{statusMessage}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {analysisState.queryList.length > 0 ? (
        <ul className="mt-8 space-y-2">
          {analysisState.queryList.map((query, index) => {
            const isDone = index < analysisState.completedQueries;
            const isActive =
              analysisState.stage === "analyzing" &&
              index === analysisState.completedQueries;

            return (
              <li
                key={query}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <span className="mt-0.5 shrink-0">
                  {isDone ? (
                    <span className="text-emerald-600">✓</span>
                  ) : isActive ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  ) : (
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </span>
                <span className={isDone ? "text-slate-700" : "text-slate-500"}>
                  {query}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
