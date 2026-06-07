interface CompetitorsPromptParams {
  brand: string;
  category: string;
}

interface QueriesPromptParams {
  brand: string;
  category: string;
}

interface QueryPromptParams {
  query: string;
  category: string;
}

interface GeoAuditPromptParams {
  brand: string;
  category: string;
  content: string;
}

interface RecommendationsPromptParams {
  brand: string;
  role: string;
  category: string;
  visibilityRate: number;
  gapQueries: string[];
  geoScore: number | null;
  geoTopIssues: string[];
}

export function competitorsPrompt({
  brand,
  category,
}: CompetitorsPromptParams): { system: string; user: string } {
  return {
    system: `You are a market research analyst. Return ONLY a JSON array of the 5 most prominent competitor brands to ${brand} in the ${category} category. No markdown.`,
    user: `Return a JSON array of 5 competitor brand names for ${brand} in ${category}.`,
  };
}

export function queriesPrompt({
  category,
}: QueriesPromptParams): { system: string; user: string } {
  return {
    system: "Return ONLY a JSON array of 10 strings. No markdown.",
    user: `Generate 10 realistic, varied consumer queries someone would type into an AI chatbot to discover ${category}. Cover: general recommendations, specific needs (budget, use case), comparisons, expert-level, beginner-level. Return a JSON array of 10 query strings.`,
  };
}

export function queryPrompt({
  query,
  category,
}: QueryPromptParams): { system: string; user: string } {
  return {
    system: `You are a helpful assistant answering consumer questions about ${category}. Give natural, practical recommendations and mention specific brands where relevant.`,
    user: query,
  };
}

export function geoAuditPrompt({
  brand,
  category,
  content,
}: GeoAuditPromptParams): { system: string; user: string } {
  return {
    system:
      "You are a GEO (Generative Engine Optimization) analyst. You score brand content against criteria proven to improve visibility in AI-generated recommendations, based on academic research (Princeton GEO paper, KDD 2024). Return ONLY valid JSON, no markdown.",
    user: `Analyse this content for the brand "${brand}" in the "${category}" category.

Score it on five criteria (0–20 each):
1. Statistics & Data — specific numbers, percentages, quantitative claims
2. Citations & Sources — references to third-party sources, reviews, studies, endorsements
3. Attribute Clarity — explicit differentiators, price positioning, use cases, target customer
4. Fluency & Structure — clear, well-structured, easy for AI systems to parse
5. Query Alignment — directly answers common consumer questions about ${category}

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
  role,
  category,
  visibilityRate,
  gapQueries,
  geoScore,
  geoTopIssues,
}: RecommendationsPromptParams): { system: string; user: string } {
  const geoScoreText =
    geoScore !== null ? `${geoScore}/100` : "not available (no content provided)";
  const geoIssuesText =
    geoTopIssues.length > 0 ? geoTopIssues.join(", ") : "none identified";

  return {
    system:
      "You are a senior digital marketing strategist specialising in AI/GEO optimisation. Return ONLY a JSON array, no markdown.",
    user: `Generate 5 specific, actionable recommendations for a ${role} at ${brand} to improve their AI chatbot visibility in the ${category} category. AI visibility is currently ${visibilityRate}%. Missing from ${gapQueries.length} queries: ${gapQueries.join(", ") || "none"}. GEO content score is ${geoScoreText} with issues: ${geoIssuesText}. Each recommendation needs a short title and 2 concrete sentences. Return: [{"title": string, "action": string}]`,
  };
}

export function defaultQueries(category: string): string[] {
  return [
    `best ${category}`,
    `top rated ${category}`,
    `most popular ${category} brands`,
    `${category} comparison`,
    `best value ${category}`,
    `${category} for beginners`,
    `premium ${category}`,
    `${category} recommendations`,
    `which ${category} should I buy`,
    `${category} pros and cons`,
  ];
}
