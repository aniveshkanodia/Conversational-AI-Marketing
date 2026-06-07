"use client";

import { useCallback, useState } from "react";
import { BriefForm } from "@/components/BriefForm";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type {
  AnalysisResults,
  AnalysisState,
  Brief,
  GeoScore,
  Recommendation,
} from "@/lib/types";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed: ${url}`,
    );
  }

  return data;
}

export default function HomePage() {
  const [view, setView] = useState<"brief" | "loading" | "results">("brief");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState | null>(
    null,
  );
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = useCallback(
    async (
      currentBrief: Brief,
      competitors: string[],
      geoAudit: GeoScore,
      onUpdate: (items: Recommendation[]) => void,
    ) => {
      setRecommendationsLoading(true);

      try {
        const geoTopIssues = geoAudit.criteria
          .filter((criterion) => criterion.score < 12)
          .map((criterion) => criterion.issue);

        const recommendations = await postJSON<Recommendation[]>(
          "/api/recommendations",
          {
            brand: currentBrief.brand,
            role: currentBrief.role,
            brandUrl: currentBrief.brandUrl,
            competitors,
            geoScore: geoAudit.overall,
            geoTopIssues,
          },
        );

        onUpdate(recommendations);
      } catch (recommendationError) {
        console.error(recommendationError);
      } finally {
        setRecommendationsLoading(false);
      }
    },
    [],
  );

  const runAnalysis = useCallback(
    async (submittedBrief: Brief) => {
      setError("");
      setBrief(submittedBrief);
      setView("loading");
      setResults(null);

      setAnalysisState({ stage: "competitors" });

      try {
        let competitors = submittedBrief.competitors;

        if (competitors.length === 0) {
          competitors = await postJSON<string[]>("/api/competitors", {
            brand: submittedBrief.brand,
            brandUrl: submittedBrief.brandUrl,
          });
        }

        setAnalysisState({ stage: "geo" });

        const geoAudit = await postJSON<GeoScore>("/api/geo-audit", {
          brand: submittedBrief.brand,
          brandUrl: submittedBrief.brandUrl,
          content: submittedBrief.productContent,
          competitors,
        });

        setAnalysisState({ stage: "done" });

        const baseResults: AnalysisResults = {
          brief: submittedBrief,
          competitors,
          geoAudit,
          recommendations: [],
          runAt: new Date().toISOString(),
        };

        setResults(baseResults);
        setView("results");

        void fetchRecommendations(
          submittedBrief,
          competitors,
          geoAudit,
          (recommendations) => {
            setResults((prev) =>
              prev ? { ...prev, recommendations } : prev,
            );
          },
        );
      } catch (analysisError) {
        const message =
          analysisError instanceof Error
            ? analysisError.message
            : "Analysis failed";
        setError(message);
        setView("brief");
        setAnalysisState(null);
      }
    },
    [fetchRecommendations],
  );

  function handleNewReport() {
    setView("brief");
    setBrief(null);
    setAnalysisState(null);
    setResults(null);
    setRecommendationsLoading(false);
    setError("");
  }

  return (
    <main>
      {error ? (
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      ) : null}

      {view === "brief" ? <BriefForm onSubmit={runAnalysis} /> : null}

      {view === "loading" && brief && analysisState ? (
        <LoadingScreen brief={brief} analysisState={analysisState} />
      ) : null}

      {view === "results" && results ? (
        <ResultsDashboard
          results={results}
          recommendationsLoading={recommendationsLoading}
          onNewReport={handleNewReport}
        />
      ) : null}
    </main>
  );
}
