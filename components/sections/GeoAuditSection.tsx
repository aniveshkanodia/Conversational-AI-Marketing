"use client";

import { useState } from "react";
import type { GeoScore } from "@/lib/types";
import { geoScoreColor } from "@/lib/utils";

interface GeoAuditSectionProps {
  geoAudit: GeoScore;
}

export function GeoAuditSection({ geoAudit }: GeoAuditSectionProps) {
  const [exampleOpen, setExampleOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
        <h3 className="text-lg font-semibold">📊 GEO Content Audit</h3>
        <p className="mt-1 text-xs text-slate-400">
          Based on Princeton GEO research (KDD &apos;24) — content optimised with
          these signals shows up to 40% higher visibility in AI-generated
          responses.
        </p>
      </div>

      <div className="grid gap-8 p-6 lg:grid-cols-[240px_1fr]">
        <div>
          <p
            className={`text-5xl font-bold ${geoScoreColor(geoAudit.overall)}`}
          >
            {geoAudit.overall}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            GEO Readiness Score
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Criterion</th>
                <th className="pb-2 font-medium">Score /20</th>
                <th className="pb-2 font-medium">Issue</th>
                <th className="pb-2 font-medium">Fix</th>
              </tr>
            </thead>
            <tbody>
              {geoAudit.criteria.map((criterion) => (
                <tr key={criterion.name} className="border-t border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-800">
                    {criterion.name}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{criterion.score}</td>
                  <td className="py-3 pr-4 text-slate-600">{criterion.issue}</td>
                  <td className="py-3 text-slate-600">{criterion.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-6">
        <h4 className="text-sm font-semibold text-slate-800">
          Top 3 recommendations
        </h4>
        <ol className="mt-4 space-y-3">
          {geoAudit.topRecommendations.map((item, index) => (
            <li
              key={item}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
            >
              <span className="mr-2 font-semibold text-slate-900">
                {index + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-slate-100 px-6 py-6">
        <button
          type="button"
          onClick={() => setExampleOpen((open) => !open)}
          className="text-sm font-semibold text-slate-800 hover:text-slate-600"
        >
          {exampleOpen ? "Hide" : "Show"} example of optimised content
        </button>
        {exampleOpen ? (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {geoAudit.optimizedExample}
          </p>
        ) : null}
      </div>
    </section>
  );
}
