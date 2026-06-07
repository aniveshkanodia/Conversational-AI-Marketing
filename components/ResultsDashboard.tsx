"use client";

import type { AnalysisResults } from "@/lib/types";
import {
  countWeakCriteria,
  geoScoreColor,
  weakestCriterion,
} from "@/lib/utils";
import { GeoAuditSection } from "./sections/GeoAuditSection";
import { RecommendationsSection } from "./sections/RecommendationsSection";

interface ResultsDashboardProps {
  results: AnalysisResults;
  recommendationsLoading: boolean;
  onNewReport: () => void;
}

export function ResultsDashboard({
  results,
  recommendationsLoading,
  onNewReport,
}: ResultsDashboardProps) {
  const { geoAudit } = results;
  const weakCount = countWeakCriteria(geoAudit.criteria);
  const weakest = weakestCriterion(geoAudit.criteria);

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
            Brand Positioning Report
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {results.brief.brand} ·{" "}
            <a
              href={results.brief.brandUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 underline hover:text-slate-900"
            >
              {results.brief.brandUrl}
            </a>
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
          <strong className="text-slate-800">Competitors:</strong>{" "}
          {results.competitors.join(", ")}
        </span>
        <span>
          <strong className="text-slate-800">Date:</strong> {formattedDate}
        </span>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="GEO Readiness Score"
          value={String(geoAudit.overall)}
          colorClass={geoScoreColor(geoAudit.overall)}
        />
        <MetricCard
          label="Criteria below 12/20"
          value={String(weakCount)}
          colorClass={
            weakCount === 0
              ? "text-emerald-600"
              : weakCount <= 2
                ? "text-amber-600"
                : "text-red-600"
          }
        />
        <MetricCard
          label="Weakest criterion"
          value={weakest ? `${weakest.score}/20` : "—"}
          subtitle={weakest?.name}
          colorClass={weakest ? geoScoreColor(weakest.score * 5) : "text-slate-500"}
        />
      </div>

      <div className="space-y-6">
        <GeoAuditSection geoAudit={results.geoAudit} />
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
  subtitle,
  colorClass,
}: {
  label: string;
  value: string;
  subtitle?: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
      {subtitle ? (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  );
}
