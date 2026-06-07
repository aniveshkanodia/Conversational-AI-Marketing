export const EXTERNAL_AUDITOR_ROLE = "External AI/GEO Consultant";

export interface Brief {
  brand: string;
  role: string;
  brandUrl: string;
  competitors: string[];
  productContent: string;
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
  competitors: string[];
  geoAudit: GeoScore;
  recommendations: Recommendation[];
  runAt: string;
}

export interface AnalysisState {
  stage: "competitors" | "geo" | "done";
}

export type AppView = "brief" | "loading" | "results";

export interface AppState {
  view: AppView;
  brief: Brief | null;
  analysisState: AnalysisState | null;
  results: AnalysisResults | null;
  recommendationsLoading: boolean;
}

export interface GeoAuditApiResponse {
  overall_score: number;
  criteria: GeoCriterion[];
  top_recommendations: string[];
  optimized_example: string;
}
