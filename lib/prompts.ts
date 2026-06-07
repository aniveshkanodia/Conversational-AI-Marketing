interface CompetitorsPromptParams {
  brand: string;
  brandUrl: string;
}

interface GeoAuditPromptParams {
  brand: string;
  brandUrl: string;
  content: string;
  competitors: string[];
}

interface RecommendationsPromptParams {
  brand: string;
  role: string;
  brandUrl: string;
  competitors: string[];
  geoScore: number;
  geoTopIssues: string[];
}

export function competitorsPrompt({
  brand,
  brandUrl,
}: CompetitorsPromptParams): { system: string; user: string } {
  return {
    system: `You are a market research analyst. Return ONLY a JSON array of the 5 most prominent competitor brands to ${brand} (website: ${brandUrl}). No markdown.`,
    user: `Return a JSON array of 5 competitor brand names for ${brand} at ${brandUrl}.`,
  };
}

export function geoAuditPrompt({
  brand,
  brandUrl,
  content,
  competitors,
}: GeoAuditPromptParams): { system: string; user: string } {
  const competitorContext =
    competitors.length > 0
      ? `Key competitors: ${competitors.join(", ")}. Consider how this content positions ${brand} relative to them.`
      : "";

  return {
    system:
      "You are a GEO (Generative Engine Optimization) analyst. You score brand content against criteria proven to improve visibility in AI-generated recommendations, based on academic research (Princeton GEO paper, KDD 2024). Return ONLY valid JSON, no markdown.",
    user: `Analyse this content for the brand "${brand}" (website: ${brandUrl}).
${competitorContext}

Score it on five criteria (0–20 each):
1. Statistics & Data — specific numbers, percentages, quantitative claims
2. Citations & Sources — references to third-party sources, reviews, studies, endorsements
3. Attribute Clarity — explicit differentiators, price positioning, use cases, target customer
4. Fluency & Structure — clear, well-structured, easy for AI systems to parse
5. Query Alignment — directly answers common consumer questions about the brand and its products

Return this exact JSON:
{
  "overall_score": <number 0-100>,
  "criteria": [
    {
      "name": "Statistics & Data",
      "score": <0-20>,
      "issue": "<one sentence: what is missing>",
      "fix": "<one sentence: specific action to take>"
    },
    ... (all 5 criteria)
  ],
  "top_recommendations": [
    "<specific action 1>",
    "<specific action 2>",
    "<specific action 3>"
  ],
  "optimized_example": "<rewritten paragraph of their content applying the top fixes>"
}

Content to analyse:
${content}`,
  };
}

export function recommendationsPrompt({
  brand,
  brandUrl,
  competitors,
  geoScore,
  geoTopIssues,
}: RecommendationsPromptParams): { system: string; user: string } {
  const competitorText =
    competitors.length > 0 ? competitors.join(", ") : "none identified";
  const geoIssuesText =
    geoTopIssues.length > 0 ? geoTopIssues.join(", ") : "none identified";

  return {
    system:
      "You are a senior digital marketing strategist specialising in AI/GEO optimisation. Return ONLY a JSON array, no markdown.",
    user: `Generate 5 specific, actionable recommendations for an external AI/GEO consultant auditing ${brand}'s online content positioning (website: ${brandUrl}). Key competitors: ${competitorText}. GEO content score is ${geoScore}/100 with issues: ${geoIssuesText}. Focus on content changes that improve how AI systems understand, cite, and recommend the brand. Each recommendation needs a short title and 2 concrete sentences. Return: [{"title": string, "action": string}]`,
  };
}
