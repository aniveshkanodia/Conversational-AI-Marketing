# GEO Brand Positioning Audit — MVP Spec

**For:** Profound AI Strategist application demo  
**Deploy target:** Vercel free tier  
**Build environment:** Cursor  
**Last updated:** June 2026

---

## 1. What This Is

A web tool that audits how well a brand's online content is structured for AI discovery and citation — scored against the Princeton GEO paper (KDD '24). Users paste product page or brand description copy, and the tool returns a GEO readiness score, criterion-level breakdown, specific content fixes, and role-aware recommendations.

This is the **content optimisation layer** that complements monitoring products like Profound. Profound tracks whether a brand appears in AI chatbots; this tool scores whether the brand's public content is written so AI systems can understand, cite, and recommend it.

Princeton GEO paper (KDD '24) is in `/references/Generative Engine Optimization.pdf`

**Primary user:** Marketing professional (GEO Manager, CMO, Brand Manager) or external AI/GEO consultant auditing a brand.  
**Demo context:** Profound AI Strategist application — shows applied AI analysis capability beyond monitoring-only products.

**Explicitly out of scope:** AI visibility monitoring (requires multi-model, multi-query tracking at scale — Profound's domain). No synthetic query probes.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Vercel-native, API routes, TypeScript |
| Styling | Tailwind CSS | Fast, no config overhead |
| LLM | Anthropic Claude (claude-sonnet-4-20250514) | Production key |
| API | Next.js API Routes | Server-side key, no exposure |
| State | React useState | Stateless demo, no DB needed |
| Deploy | Vercel free tier | One command deploy |
| Package manager | npm | Standard |

**No database. No auth. Stateless demo.**

---

## 3. Project Structure

```
ai-brand-positioning/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main app — all state lives here
│   └── globals.css
├── app/api/
│   ├── competitors/route.ts        # Auto-detect competitors for a brand/URL
│   ├── geo-audit/route.ts          # GEO content audit → score + recommendations
│   └── recommendations/route.ts    # Role-specific action recommendations
├── components/
│   ├── BriefForm.tsx               # Step 1: input
│   ├── LoadingScreen.tsx           # Step 2: progress
│   ├── ResultsDashboard.tsx        # Step 3: wrapper + metric cards
│   └── sections/
│       ├── GeoAuditSection.tsx     # Core differentiator
│       └── RecommendationsSection.tsx
├── lib/
│   ├── types.ts                    # All shared types
│   ├── prompts.ts                  # All LLM prompt templates
│   ├── utils.ts                    # JSON parsing, GEO score helpers
│   └── llm.ts                      # Ollama / Anthropic provider switch
├── docs/
│   ├── spec.md                     # MVP spec (this file)
│   ├── progress.md                 # Build progress log
│   └── project-notes.md            # Deployment and UX decisions
├── references/
│   └── Generative Engine Optimization.pdf
├── .env.local
├── .env.example
├── AGENTS.md                       # AI agent instructions
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. App Flow & State

Single page (`app/page.tsx`) manages three views:

```typescript
type AppView = 'brief' | 'loading' | 'results'

interface AppState {
  view: AppView
  brief: Brief | null
  analysisState: AnalysisState | null
  results: AnalysisResults | null
  recommendationsLoading: boolean
}
```

**Flow:**
```
BriefForm (view: 'brief')
  → submit → validate → set view: 'loading'
  → LoadingScreen runs: competitors → geo audit
  → on complete → set view: 'results'
  → ResultsDashboard renders
  → recommendations fetch async (non-blocking)
  → "New report" button → reset → view: 'brief'
```

**Analysis sequence:**
1. Auto-detect competitors (if not provided) via `/api/competitors`
2. Run GEO content audit via `/api/geo-audit` (passes competitors for comparative context)
3. Display results; fetch recommendations via `/api/recommendations` in background

---

## 5. Types (`lib/types.ts`)

```typescript
export interface Brief {
  brand: string
  role: string
  brandUrl: string                // required — brand website URL
  competitors: string[]           // empty = auto-detect
  productContent: string          // required — pasted copy for GEO audit
}

export interface GeoScore {
  overall: number                 // 0–100
  criteria: GeoCriterion[]
  topRecommendations: string[]    // 3 specific actions
  optimizedExample: string        // rewritten paragraph
}

export interface GeoCriterion {
  name: string
  score: number                   // 0–20
  issue: string
  fix: string
}

export interface AnalysisResults {
  brief: Brief
  competitors: string[]           // final list (user-provided or auto-detected)
  geoAudit: GeoScore
  recommendations: Recommendation[]
  runAt: string                   // ISO timestamp
}

export interface Recommendation {
  title: string
  action: string
}

export interface AnalysisState {
  stage: 'competitors' | 'geo' | 'done'
}
```

---

## 6. Feature Specs

### 6.1 Brief Form (`components/BriefForm.tsx`)

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Brand name | text input | yes | e.g. "Hoka" |
| Brand URL | url input | yes | e.g. "https://www.hoka.com" |
| Competitors | text input | no | Comma-separated. Placeholder: "Leave blank to auto-detect" |
| Product content | textarea | yes | Paste homepage, product page, or brand description copy |

Role is fixed to `External AI/GEO Consultant` — not shown in the form.

**Validation:** brand, brandUrl, and productContent required. brandUrl must be a valid http/https URL.

**Submit button text:** "Run GEO audit →"

**Default brief:** Pre-filled Hoka example with sample product content for demo.

---

### 6.2 Loading Screen (`components/LoadingScreen.tsx`)

Shows eyebrow: "[Brand] · [Category]", title: "Auditing online content for AI positioning"

**Stages with status messages:**

1. `competitors` → "Identifying key competitors..."
2. `geo` → "Running GEO content audit..."
3. `done` → "Finalising report..."

Progress bar: 30% → 70% → 100%.

Supporting text explains Princeton GEO criteria being applied.

---

### 6.3 Results Dashboard (`components/ResultsDashboard.tsx`)

**Top bar (brief summary):** Brand | Category | Competitors | Date

**Three metric cards:**

- GEO Readiness Score (0–100)
- Criteria below 12/20 (count)
- Weakest criterion (score + name)

Color logic: green / amber / red thresholds per metric.

**Sections — in order:**

1. GEO Content Audit (📊)
2. Recommendations (🎯)

---

### 6.4 GEO Content Audit Section (`sections/GeoAuditSection.tsx`)

Left: GEO Score — large number (0–100), colour-coded, label "GEO Readiness Score"

Criteria table:

| Criterion | Score /20 | Issue | Fix |
|---|---|---|---|
| Statistics & Data | score | what's missing | specific action |
| Citations & Sources | score | what's missing | specific action |
| Attribute Clarity | score | what's missing | specific action |
| Fluency & Structure | score | what's missing | specific action |
| Query Alignment | score | what's missing | specific action |

Header note: "Based on Princeton GEO research (KDD '24) — content optimised with these signals shows up to 40% higher visibility in AI-generated responses."

Below criteria: **Top 3 recommendations** — numbered cards with specific action text.

Below recommendations: **Optimised example** — collapsible block showing a rewritten paragraph applying the GEO fixes.

---

### 6.5 Recommendations Section (`sections/RecommendationsSection.tsx`)

Five numbered recommendations, each with bold title + 2-sentence action text. Generated by Claude, informed by GEO audit results and competitor context.

Loading state shown while generating (runs after results display, non-blocking).

---

## 7. API Routes

### `POST /api/competitors`

**Input:**

```json
{ "brand": "Hoka", "brandUrl": "https://www.hoka.com" }
```

**System:** You are a market research analyst. Return ONLY a JSON array of the 5 most prominent competitor brands to {brand} (website: {brandUrl}). No markdown.

**Output:** `string[]`

Used to provide competitive context for the GEO audit and recommendations. Auto-detect when user leaves competitors blank.

---

### `POST /api/geo-audit`

**Input:**

```json
{
  "brand": "Hoka",
  "brandUrl": "https://www.hoka.com",
  "content": "[pasted product page text]",
  "competitors": ["Brooks", "Asics", "Nike", "New Balance", "Saucony"]
}
```

**System:** You are a GEO (Generative Engine Optimization) analyst. You score brand content against criteria proven to improve visibility in AI-generated recommendations, based on academic research (Princeton GEO paper, KDD 2024). Return ONLY valid JSON, no markdown.

**User:** Analyse content for brand at brandUrl. Include competitor context when provided. Score on five criteria (0–20 each):

1. Statistics & Data
2. Citations & Sources
3. Attribute Clarity
4. Fluency & Structure
5. Query Alignment

Return JSON with `overall_score`, `criteria[]`, `top_recommendations[]`, `optimized_example`.

**Output:** `GeoScore`

---

### `POST /api/recommendations`

**Input:**

```json
{
  "brand": "Hoka",
  "role": "External AI/GEO Consultant",
  "brandUrl": "https://www.hoka.com",
  "competitors": ["Brooks", "Asics", "Nike"],
  "geoScore": 45,
  "geoTopIssues": ["Missing statistics", "No third-party citations"]
}
```

**System:** You are a senior digital marketing strategist specialising in AI/GEO optimisation. Return ONLY a JSON array, no markdown.

**User:** Generate 5 specific, actionable recommendations for an external AI/GEO consultant auditing {brand}'s online content positioning (website: {brandUrl}). Key competitors: {competitors}. GEO content score is {geoScore}/100 with issues: {geoTopIssues}. Focus on content changes that improve how AI systems understand, cite, and recommend the brand.

**Output:** `Recommendation[]`

---

## 8. Utility Functions (`lib/utils.ts`)

```typescript
function isValidUrl(value: string): boolean
function safeParseJSON<T>(raw: string): T | null
function mapGeoAuditResponse(data: GeoAuditApiResponse): GeoScore
function geoScoreColor(score: number): string
function countWeakCriteria(criteria: GeoCriterion[]): number
function weakestCriterion(criteria: GeoCriterion[]): GeoCriterion | null
```

---

## 9. Prompts File (`lib/prompts.ts`)

Centralise all prompt templates here as exported functions:

- `competitorsPrompt()`
- `geoAuditPrompt()`
- `recommendationsPrompt()`

API routes import from `prompts.ts` rather than hardcoding strings.

---

## 10. Environment Variables

`.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=anthropic
```

For local dev with Ollama:
```
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
```

Never expose API keys to the client. All LLM calls go through Next.js API routes.

---

## 11. Vercel Deployment

**Steps:**
1. Push repo to GitHub
2. Import to Vercel — auto-detects Next.js
3. Add environment variables
4. Deploy

**Free tier constraints:**
- API route timeout: 10s. Each route makes a single LLM call — stays well within 10s.
- No background jobs, no streaming.

---

## 12. Design Principles

- Clean, data-forward, professional — not a toy
- Dark section headers, light content areas
- Colour accent on key metrics (score colours)
- No animations beyond the progress bar
- Mobile-readable (overflow-x scroll on tables)
- Tailwind only — no external component libraries

---

## 13. README (to include in repo)

Should cover:
- What it does and why it's differentiated (GEO content audit for AI positioning)
- The research it's grounded in (Princeton GEO paper, KDD '24)
- Setup: clone → npm install → add .env.local → npm run dev
- Deploy: Vercel one-click
- Architecture decisions (stateless, competitor auto-detect, async recommendations)

---

## 14. Out of Scope (for this build)

- User authentication
- Report saving / history
- AI visibility monitoring (Profound's domain — no synthetic query probes)
- Real GPT-4 / Gemini API calls
- GEO-bench dataset integration (deferred)
- PDF export
- Social media or SEO channel analysis
- Database of any kind
- URL crawling (paste content only for now)
- Payment / subscription

These are noted in the UI as "coming soon" or "full version" where relevant.
