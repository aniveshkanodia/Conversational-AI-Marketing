"use client";

import type { AnalysisState, Brief } from "@/lib/types";

interface LoadingScreenProps {
  brief: Brief;
  analysisState: AnalysisState;
}

const STAGE_MESSAGES: Record<AnalysisState["stage"], string> = {
  competitors: "Identifying key competitors...",
  geo: "Running GEO content audit...",
  done: "Finalising report...",
};

function progressPercent(stage: AnalysisState["stage"]): number {
  if (stage === "competitors") return 30;
  if (stage === "geo") return 70;
  return 100;
}

export function LoadingScreen({ brief, analysisState }: LoadingScreenProps) {
  const progress = progressPercent(analysisState.stage);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium text-slate-500">
        {brief.brand} · {brief.brandUrl}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        Auditing online content for AI positioning
      </h2>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>{STAGE_MESSAGES[analysisState.stage]}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Scoring your content to evaluate the signal that help AI systems
        understand, cite, and recommend your brand.
      </p>
    </div>
  );
}
