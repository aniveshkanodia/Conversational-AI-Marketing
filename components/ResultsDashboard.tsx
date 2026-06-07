"use client";

import type { AnalysisResults } from "@/lib/types";
import {
  computeGapCount,
  computeMetrics,
  metricColor,
} from "@/lib/utils";
import { AssociationsSection } from "./sections/AssociationsSection";
import { GapsSection } from "./sections/GapsSection";
import { GeoAuditSection } from "./sections/GeoAuditSection";
import { RecommendationsSection } from "./sections/RecommendationsSection";
import { VisibilitySection } from "./sections/VisibilitySection";

interface ResultsDashboardProps {
  results: AnalysisResults;
  recommendationsLoading: boolean;
  onNewReport: () => void;
}

const CHANNEL_LABELS = {
  ai: "AI Chatbots",
  social: "Social Media",
  search: "Search / SEO",
} as const;

export function ResultsDashboard({
  results,
  recommendationsLoading,
  onNewReport,
}: ResultsDashboardProps) {
  const metrics = computeMetrics(results.queries, results.brief.brand);
  const gapCount = computeGapCount(
    results.queries,
    results.brief.brand,
    results.competitors,
  );

  const formattedDate = new Date(results.runAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Positioning Report
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {results.brief.brand} · {results.brief.category} ·{" "}
            {CHANNEL_LABELS[results.brief.channel]} · {results.brief.role}
          </p>
        </div>
        <button
          type="button"
          onClick={onNewReport}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          New report
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span>
          <strong className="text-slate-800">Competitors tracked:</strong>{" "}
          {results.competitors.join(", ")}
        </span>
        <span>
          <strong className="text-slate-800">Queries run:</strong>{" "}
          {results.queries.length}
        </span>
        <span>
          <strong className="text-slate-800">Date:</strong> {formattedDate}
        </span>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="AI Visibility Rate"
          value={`${metrics.visibilityRate}%`}
          colorClass={metricColor("visibility", metrics.visibilityRate)}
        />
        <MetricCard
          label="Average Position"
          value={
            metrics.averagePosition !== null
              ? String(metrics.averagePosition)
              : "—"
          }
          colorClass={
            metrics.averagePosition !== null
              ? metricColor("position", metrics.averagePosition)
              : "text-slate-500"
          }
        />
        <MetricCard
          label="Competitive Gaps"
          value={String(gapCount)}
          colorClass={metricColor("gaps", gapCount)}
        />
      </div>

      <div className="space-y-6">
        <VisibilitySection
          brief={results.brief}
          queries={results.queries}
          competitors={results.competitors}
        />
        <AssociationsSection brief={results.brief} queries={results.queries} />
        <GapsSection
          brief={results.brief}
          queries={results.queries}
          competitors={results.competitors}
        />
        <GeoAuditSection brief={results.brief} geoAudit={results.geoAudit} />
        <RecommendationsSection
          recommendations={results.recommendations}
          loading={recommendationsLoading}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
