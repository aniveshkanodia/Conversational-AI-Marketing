import type { GeoAuditApiResponse, GeoScore } from "./types";

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeParseJSON<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export function mapGeoAuditResponse(data: GeoAuditApiResponse): GeoScore {
  return {
    overall: data.overall_score,
    criteria: data.criteria,
    topRecommendations: data.top_recommendations,
    optimizedExample: data.optimized_example,
  };
}

export function geoScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

export function countWeakCriteria(criteria: GeoScore["criteria"]): number {
  return criteria.filter((criterion) => criterion.score < 12).length;
}

export function weakestCriterion(
  criteria: GeoScore["criteria"],
): GeoScore["criteria"][number] | null {
  if (criteria.length === 0) return null;
  return criteria.reduce((weakest, current) =>
    current.score < weakest.score ? current : weakest,
  );
}
