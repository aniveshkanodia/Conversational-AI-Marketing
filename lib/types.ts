export interface Brief {
  brand: string;
  role: string;
  category: string;
  competitors: string[];
  channel: "ai" | "social" | "search";
  productContent?: string;
}

export interface QueryResult {
  query: string;
  response: string;
  brandMentions: BrandMention[];
}

export interface BrandMention {
  brand: string;
  position: number;
  charIndex: number;
}

export interface GeoScore {
  overall: number;
  criteria: GeoCriterion[];
  topRecommendations: string[];
  optimizedExample: string;
}

export interface GeoCriterion {
  name: string;
  score: number;
  issue: string;
  fix: string;
}

export interface Recommendation {
  title: string;
  action: string;
}

export interface AnalysisResults {
  brief: Brief;
  queries: QueryResult[];
  competitors: string[];
  geoAudit: GeoScore | null;
  recommendations: Recommendation[];
  runAt: string;
}

export interface AnalysisState {
  stage: "competitors" | "queries" | "analyzing" | "geo" | "done";
  currentQuery: string;
  completedQueries: number;
  totalQueries: number;
  queryList: string[];
}

export type AppView = "brief" | "loading" | "results";

export interface AppState {
  view: AppView;
  brief: Brief | null;
  analysisState: AnalysisState | null;
  results: AnalysisResults | null;
  recommendationsLoading: boolean;
}

export interface Metrics {
  visibilityRate: number;
  averagePosition: number | null;
  gapCount: number;
}

export interface GapQuery {
  query: string;
  competitorsAppeared: string[];
}

export interface GeoAuditApiResponse {
  overall_score: number;
  criteria: GeoCriterion[];
  top_recommendations: string[];
  optimized_example: string;
}
