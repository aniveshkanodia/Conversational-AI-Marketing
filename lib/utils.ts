import type {
  BrandMention,
  GapQuery,
  GeoAuditApiResponse,
  GeoScore,
  Metrics,
  QueryResult,
} from "./types";

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectBrands(text: string, brands: string[]): BrandMention[] {
  const mentions: BrandMention[] = [];

  for (const brand of brands) {
    const pattern = new RegExp(`\\b${escapeRegExp(brand)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      mentions.push({
        brand,
        position: 0,
        charIndex: match.index,
      });
    }
  }

  mentions.sort((a, b) => a.charIndex - b.charIndex);

  const seen = new Set<string>();
  const unique: BrandMention[] = [];

  for (const mention of mentions) {
    const key = mention.brand.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...mention, position: unique.length + 1 });
  }

  return unique;
}

export function extractSnippet(
  text: string,
  brand: string,
  charsBefore: number,
  charsAfter: number,
): string {
  const pattern = new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i");
  const match = pattern.exec(text);

  if (!match) {
    return text.slice(0, charsBefore + charsAfter).trim();
  }

  const start = Math.max(0, match.index - charsBefore);
  const end = Math.min(text.length, match.index + brand.length + charsAfter);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";

  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function computeMetrics(
  results: QueryResult[],
  brand: string,
): Metrics {
  const brandLower = brand.toLowerCase();
  const mentioned = results.filter((result) =>
    result.brandMentions.some(
      (mention) => mention.brand.toLowerCase() === brandLower,
    ),
  );

  const visibilityRate =
    results.length === 0
      ? 0
      : Math.round((mentioned.length / results.length) * 100);

  const positions = mentioned
    .map((result) => {
      const mention = result.brandMentions.find(
        (item) => item.brand.toLowerCase() === brandLower,
      );
      return mention?.position ?? null;
    })
    .filter((position): position is number => position !== null);

  const averagePosition =
    positions.length === 0
      ? null
      : Math.round(
          (positions.reduce((sum, value) => sum + value, 0) / positions.length) *
            10,
        ) / 10;

  return {
    visibilityRate,
    averagePosition,
    gapCount: 0,
  };
}

export function computeGapQueries(
  results: QueryResult[],
  brand: string,
  competitors: string[],
): GapQuery[] {
  const brandLower = brand.toLowerCase();
  const competitorSet = new Set(competitors.map((c) => c.toLowerCase()));
  const gaps: GapQuery[] = [];

  for (const result of results) {
    const brandMentioned = result.brandMentions.some(
      (mention) => mention.brand.toLowerCase() === brandLower,
    );

    if (brandMentioned) continue;

    const competitorsAppeared = result.brandMentions
      .map((mention) => mention.brand)
      .filter((name) => competitorSet.has(name.toLowerCase()));

    if (competitorsAppeared.length === 0) continue;

    gaps.push({
      query: result.query,
      competitorsAppeared: Array.from(new Set(competitorsAppeared)),
    });
  }

  return gaps;
}

export function computeGapCount(
  results: QueryResult[],
  brand: string,
  competitors: string[],
): number {
  return computeGapQueries(results, brand, competitors).length;
}

export function mapGeoAuditResponse(data: GeoAuditApiResponse): GeoScore {
  return {
    overall: data.overall_score,
    criteria: data.criteria,
    topRecommendations: data.top_recommendations,
    optimizedExample: data.optimized_example,
  };
}

export function getBrandPosition(
  result: QueryResult,
  brand: string,
): number | null {
  const mention = result.brandMentions.find(
    (item) => item.brand.toLowerCase() === brand.toLowerCase(),
  );
  return mention?.position ?? null;
}

export function getCompetitorMentions(
  result: QueryResult,
  brand: string,
  competitors: string[],
): BrandMention[] {
  const brandLower = brand.toLowerCase();
  const competitorSet = new Set(competitors.map((c) => c.toLowerCase()));

  return result.brandMentions.filter(
    (mention) =>
      mention.brand.toLowerCase() !== brandLower &&
      competitorSet.has(mention.brand.toLowerCase()),
  );
}

export function metricColor(
  metric: "visibility" | "position" | "gaps",
  value: number,
): string {
  if (metric === "visibility") {
    if (value >= 70) return "text-emerald-600";
    if (value >= 40) return "text-amber-600";
    return "text-red-600";
  }

  if (metric === "position") {
    if (value <= 1.5) return "text-emerald-600";
    if (value <= 2.5) return "text-amber-600";
    return "text-red-600";
  }

  if (value === 0) return "text-emerald-600";
  if (value <= 3) return "text-amber-600";
  return "text-red-600";
}

export function geoScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

export function positionBadge(position: number | null): {
  label: string;
  className: string;
} {
  if (position === null) {
    return {
      label: "Not mentioned",
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (position === 1) {
    return { label: "1st", className: "bg-emerald-100 text-emerald-700" };
  }

  if (position === 2) {
    return { label: "2nd", className: "bg-amber-100 text-amber-700" };
  }

  return { label: `${position}${position === 3 ? "rd" : "th"}`, className: "bg-red-100 text-red-700" };
}
